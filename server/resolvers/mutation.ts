import { prismaObjectType } from 'nexus-prisma';
import { stringArg, idArg } from 'nexus';
import { hash, verify } from 'argon2';
import { sign } from 'jsonwebtoken';
import { validate } from 'the-big-username-blacklist';
import * as zxcvbn from 'zxcvbn';
import * as yup from 'yup';
import * as R from 'ramda';
import { constant, identity, Lazy } from 'fp-ts/lib/function';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { Task } from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import { leftTask, rightTask, TaskEither } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
import { filter, isEmpty } from 'fp-ts/lib/Array';

import { Context, APP_SECRET, getUserId } from '../utils';
import { User, Meow } from '../generated/prisma-client';

const nameSchema = yup
  .string()
  .required()
  .trim()
  .min(3);

const tryCatch = <A>(f: Lazy<Promise<A>>): TaskEither<string, A> =>
  TE.tryCatch(f, ({ message }: Error) => message);

type HandleError = <A>(t: TaskEither<string, A>) => Task<A>;
const handleError: HandleError = T.map(
  E.fold(error => {
    throw new Error(error);
  }, identity)
);
const signupSchema = yup.object().shape({
  username: yup
    .string()
    .required()
    .lowercase()
    .trim()
    .min(3)
    .max(20)
    .matches(/^[a-zA-Z0-9]+$/, { message: '${path} must be alphanumeric' })
    .test({
      name: 'blacklisted',
      test: validate,
      message: '${path} is in blacklist'
    }),
  name: nameSchema,
  password: yup.string().required()
});

interface Schema {
  username: string;
  name: string;
  password: string;
}

const fetchOrElse = <Err, Value>(onNull: Err) => (
  f: Task<Value | null>
): TaskEither<Err, Value> => pipe(f, T.map(E.fromNullable(onNull)));

const getToken = (user: User) => ({
  token: sign({ userId: user.id }, APP_SECRET),
  user
});

export const Mutation = prismaObjectType({
  name: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        username: stringArg(),
        password: stringArg(),
        name: stringArg()
      },
      resolve: async (_, args, ctx: Context) => {
        const validateSchema = tryCatch(() => signupSchema.validate(args));

        const validatePassword = ({ username, password, name }) => {
          const {
            score,
            feedback: { suggestions, warning }
          } = zxcvbn(password, [username]);
          const suggestions_ = R.ifElse(
            R.isEmpty,
            constant(''),
            R.pipe(R.join(' '), R.concat('Some suggestions are: '))
          )(suggestions);

          const warning_ = R.ifElse(
            R.isEmpty,
            constant(''),
            R.concat(R.__, '.')
          )(warning);
          const err = R.join(' ', [
            'Password too weak.',
            warning_,
            suggestions_
          ]);
          return score < 3
            ? leftTask<string, Schema>(async () => err)
            : rightTask<string, Schema>(async () => ({
                username,
                password,
                name
              }));
        };

        const hashPassword = ({ password }: Schema) =>
          TE.tryCatch(() => hash(password), constant('UNREACHABLE ID: 5'));

        const createUser = (username: string, name: string) => (
          hashedPassword: null
        ) =>
          tryCatch(() =>
            ctx.prisma.createUser({
              username,
              password: hashedPassword,
              name
            })
          );

        return pipe(
          validateSchema,
          TE.chain(validatePassword),
          TE.chain(({ username, password, name }) =>
            pipe(
              hashPassword({ username, password, name }),
              TE.chain(createUser(username, name))
            )
          ),
          TE.map(getToken),
          handleError
        )();
      }
    });

    t.field('login', {
      type: 'AuthPayload',
      args: {
        username: stringArg(), // TODO: Support email silently
        password: stringArg()
      },
      resolve: (_, { username, password }, ctx: Context) => {
        const getUser = pipe(
          () => ctx.prisma.user({ username: username.toLowerCase().trim() }),
          fetchOrElse('No user found with that username')
        );

        const verifyPassword = (user: User) =>
          pipe(
            () => verify(user.password, password),
            T.map(b => (b ? user : null)),
            fetchOrElse('Password invalid')
          );

        return pipe(
          getUser,
          TE.chain(verifyPassword),
          TE.map(getToken),
          handleError
        )();
      }
    });

    t.field('postMeow', {
      type: 'Meow',
      args: {
        content: stringArg(),
        replyingTo: idArg({ required: false })
      },
      resolve: (_, { content, replyingTo }, ctx: Context) => {
        const userId = getUserId(ctx);
        if (content.length > 280) throw new Error('Content too long');
        if (content.length <= 0) throw new Error('Content too short');
        return ctx.prisma.createMeow({
          content: content.normalize(),
          author: { connect: { id: userId } },
          replyingTo: replyingTo ? { connect: { id: replyingTo } } : undefined
        });
      }
    });

    t.field('deleteMeow', {
      type: 'Meow',
      nullable: true,
      args: { id: idArg() },
      resolve: (_, { id }, ctx: Context) => ctx.prisma.deleteMeow({ id })
    });

    t.field('likeMeow', {
      type: 'Meow',
      nullable: true,
      args: { id: idArg() },
      resolve: async (_, { id }, ctx: Context) => {
        const userId = getUserId(ctx);

        const getLikedBy = pipe(
          () => ctx.prisma.meow({ id }).likedBy(),
          fetchOrElse('Meow does not exist')
        );

        const isMeowLiked = (us: User[]) =>
          !pipe(
            us,
            filter(x => x.id === userId),
            isEmpty
          );

        const updateMeow = (isLiked: boolean): TaskEither<string, Meow> =>
          rightTask(() =>
            ctx.prisma.updateMeow({
              data: {
                likedBy: {
                  [isLiked ? 'connect' : 'disconnect']: { id: userId }
                }
              },
              where: { id }
            })
          );

        return pipe(
          getLikedBy,
          TE.map(isMeowLiked),
          TE.chain(updateMeow),
          handleError
        )();
      }
    });

    t.field('setName', {
      type: 'User',
      args: {
        name: stringArg()
      },
      resolve: (_, args, ctx: Context) =>
        pipe(
          tryCatch(() => nameSchema.validate(args.name)),
          TE.chain(name =>
            tryCatch(() =>
              ctx.prisma.updateUser({
                where: { id: getUserId(ctx) },
                data: { name }
              })
            )
          ),
          handleError
        )()
    });
  }
});
