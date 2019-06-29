import { prismaObjectType } from 'nexus-prisma';
import { stringArg, idArg } from 'nexus';
import { Context, APP_SECRET, getUserId } from '../utils';
import { hash, verify } from 'argon2';
import { sign } from 'jsonwebtoken';
import { validate } from 'the-big-username-blacklist';
import * as zxcvbn from 'zxcvbn';
import * as yup from 'yup';
import * as R from 'ramda';
import { Prisma, User } from '../generated/prisma-client';
import { tryCatch } from 'fp-ts/lib/TaskEither';

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
  password: yup.string().required()
});

// constant :: a -> b -> a
const constant = R.curryN(2, a => a);

const nullToThrow = async <T>(fn: () => Promise<T | null>): Promise<T> => {
  const x = await fn();
  if (x) {
    return x;
  }
  throw new Error();
};

const boolToThrow = async <T>(
  fn: () => Promise<boolean>,
  def: T
): Promise<T> => {
  const x = await fn();
  if (x) {
    return def;
  }
  throw new Error();
};

export const Mutation = prismaObjectType({
  name: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        username: stringArg(),
        password: stringArg()
      },
      resolve: async (_, args, ctx: Context) => {
        const { username, password } = await signupSchema.validate(args);

        const {
          score,
          feedback: { suggestions, warning }
        } = zxcvbn(password, [username]);
        if (score < 3) {
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
          throw new Error(`Password too weak. ${warning_} ${suggestions_}`);
        }

        const hashedPassword = await hash(password);
        const user = await ctx.prisma.createUser({
          username,
          password: hashedPassword
        });

        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user
        };
      }
    });

    t.field('login', {
      type: 'AuthPayload',
      args: {
        username: stringArg(), // TODO: Support email silently
        password: stringArg()
      },
      resolve: (_, { username, password }, ctx: Context) => {
        return tryCatch(
          () =>
            nullToThrow(() =>
              ctx.prisma.user({ username: username.toLowerCase().trim() })
            ),
          () => 'No user found with that username'
        )
          .chain(user =>
            tryCatch(
              () => boolToThrow(() => verify(user.password, password), user),
              () => 'Password invalid'
            )
          )
          .fold(
            err => {
              throw new Error(err);
            },
            user => {
              return {
                token: sign({ userId: user.id }, APP_SECRET),
                user
              };
            }
          )
          .run();
      }
    });

    t.field('postMeow', {
      type: 'Meow',
      args: {
        content: stringArg()
      },
      resolve: (_, { content }, ctx: Context) => {
        const userId = getUserId(ctx);
        return ctx.prisma.createMeow({
          content,
          author: { connect: { id: userId } }
        });
      }
    });

    t.field('deleteMeow', {
      type: 'Meow',
      nullable: true,
      args: { id: idArg() },
      resolve: (_, { id }, ctx: Context) => {
        return ctx.prisma.deleteMeow({ id });
      }
    });
  }
});
