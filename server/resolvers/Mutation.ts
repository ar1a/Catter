import { prismaObjectType } from 'nexus-prisma';
import { stringArg, idArg } from 'nexus';
import { Context, APP_SECRET, getUserId } from '../utils';
import { hash, verify } from 'argon2';
import { sign } from 'jsonwebtoken';

export const Mutation = prismaObjectType({
  name: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        username: stringArg(),
        password: stringArg()
      },
      resolve: async (_, { username, password }, ctx: Context) => {
        const hashedPassword = await hash(password);
        // TODO: zxcvbn password
        if (username.length < 3) {
          throw new Error('Username too short');
        }

        if (password.length < 8) {
          throw new Error('Password too short');
        }
        const user = await ctx.prisma.createUser({
          username: username.toLowerCase(),
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
          username: username.toLowerCase()
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
