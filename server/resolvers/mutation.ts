import { prismaObjectType } from 'nexus-prisma';
import { stringArg, idArg } from 'nexus';
import { hash, verify } from 'argon2';
import { sign } from 'jsonwebtoken';
import { validate } from 'the-big-username-blacklist';
import * as zxcvbn from 'zxcvbn';
import * as yup from 'yup';
import * as R from 'ramda';
import {
  tryCatch,
  leftTask,
  rightTask,
  TaskEither,
  chain,
  map
} from 'fp-ts/lib/TaskEither';
import { left, right, fold } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { filter, isEmpty } from 'fp-ts/lib/Array';

import { Context, APP_SECRET, getUserId } from '../utils';
import { User, Meow } from '../generated/prisma-client';

const nameSchema = yup
  .string()
  .required()
  .trim()
  .min(3);

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

// constant :: a -> b -> a
const constant = <T>(a: T) => (_: any) => a;

const fromNullablePromise = <Err, Value>(
  f: () => Promise<Value | null>,
  onNull: Err
): TaskEither<Err, Value> => async () =>
  f().then(valueOrNull =>
    valueOrNull === null ? left(onNull) : right(valueOrNull)
  );
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
        const validateSchema = tryCatch(
          () => signupSchema.validate(args),
          (a: Error) => a.message
        );

        const validatePassword = ({ username, password, name }) => {
          const {
            score,
            feedback: { suggestions, warning }
          } = zxcvbn(password, [username]);
          const suggestions_ = R.ifElse(
            R.isEmpty,
            constant(''),
            R.pipe(
              R.join(' '),
              R.concat('Some suggestions are: ')
            )
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
          tryCatch(() => hash(password), constant('UNREACHABLE ID: 5'));

        const createUser = (username: string, name: string) => (
          hashedPassword: null
        ) =>
          tryCatch(
            () =>
              ctx.prisma.createUser({
                username,
                password: hashedPassword,
                name
              }),
            (a: Error) => a.message
          );

        return pipe(
          validateSchema,
          chain(validatePassword),
          chain(({ username, password, name }) =>
            pipe(
              hashPassword({ username, password, name }),
              chain(createUser(username, name))
            )
          ),
          map(getToken)
        )().then(
          fold(
            err => {
              throw new Error(err);
            },
            a => a
          )
        );
      }
    });

    t.field('login', {
      type: 'AuthPayload',
      args: {
        username: stringArg(), // TODO: Support email silently
        password: stringArg()
      },
      resolve: (_, { username, password }, ctx: Context) => {
        const getUser = fromNullablePromise(
          () => ctx.prisma.user({ username: username.toLowerCase().trim() }),
          'No user found with that username'
        );

        const verifyPassword = (user: User) =>
          fromNullablePromise(
            () => verify(user.password, password).then(b => (b ? user : null)),
            'Password invalid'
          );

        return pipe(
          getUser,
          chain(verifyPassword),
          map(getToken)
        )().then(
          fold(
            err => {
              throw new Error(err);
            },
            a => a
          )
        );
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

        const getLikedBy = fromNullablePromise<string, User[]>(
          () => ctx.prisma.meow({ id }).likedBy(),
          'Meow does not exist'
        );

        const isMeowLiked = (us: User[]) =>
          !pipe(
            us,
            filter(x => x.id === userId),
            isEmpty
          );

        const updateMeow = (isLiked: boolean): TaskEither<string, Meow> =>
          isLiked
            ? rightTask(async () =>
                ctx.prisma.updateMeow({
                  data: { likedBy: { disconnect: { id: userId } } },
                  where: { id }
                })
              )
            : rightTask(async () =>
                ctx.prisma.updateMeow({
                  data: { likedBy: { connect: { id: userId } } },
                  where: { id }
                })
              );

        return pipe(
          getLikedBy,
          map(isMeowLiked),
          chain(updateMeow)
        )().then(
          fold(
            error => {
              throw new Error(error);
            },
            a => a
          )
        );
      }
    });

    t.field('setName', {
      type: 'User',
      args: {
        name: stringArg()
      },
      resolve: (_, args, ctx: Context) => {
        const id = getUserId(ctx);
        const validateSchema = tryCatch(
          () => nameSchema.validate(args.name),
          (a: Error) => a.message
        );

        const updateUser = (name: string) =>
          tryCatch(
            () =>
              ctx.prisma.updateUser({
                where: { id },
                data: { name }
              }),
            (a: Error) => a.message
          );

        return pipe(
          validateSchema,
          chain(updateUser)
        )().then(
          fold(
            error => {
              throw new Error(error);
            },
            a => a
          )
        );
      }
    });
  }
});
