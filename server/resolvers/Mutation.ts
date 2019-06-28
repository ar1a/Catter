import { prismaObjectType } from 'nexus-prisma';
import { stringArg, idArg } from 'nexus';
import { Context, APP_SECRET, getUserId } from '../utils';
import { hash, verify } from 'argon2';
import { sign } from 'jsonwebtoken';
import { validate } from 'the-big-username-blacklist';
import * as zxcvbn from 'zxcvbn';
import * as yup from 'yup';

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
        console.log(username, password);

        const zxcvbnResults = zxcvbn(password, [username]);
        if (zxcvbnResults.score < 3) {
          let suggestions = '';
          if (zxcvbnResults.feedback.suggestions) {
            suggestions =
              'Some suggestions are: ' +
              zxcvbnResults.feedback.suggestions.join(' ');
          }

          let warning = '';
          if (zxcvbnResults.feedback.warning)
            warning = zxcvbnResults.feedback.warning + '.';
          throw new Error(`Password too weak. ${warning} ${suggestions}`);
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
      resolve: async (_, { username, password }, ctx: Context) => {
        const user = await ctx.prisma.user({
          username: username.toLowerCase().trim()
        });
        if (!user) {
          throw new Error('No user found with that username');
        }

        const passwordValid = await verify(user.password, password);
        if (!passwordValid) {
          throw new Error('Password invalid');
        }

        return {
          token: sign({ userId: user.id }, APP_SECRET),
          user
        };
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
