import { prismaObjectType } from 'nexus-prisma';
import { stringArg } from 'nexus';
import { Context, APP_SECRET } from '../utils';
import { hash, verify } from 'argon2';
import { sign } from 'jsonwebtoken';

export const Mutation = prismaObjectType({
  name: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        username: stringArg(),
        email: stringArg({ nullable: true }),
        password: stringArg()
      },
      resolve: async (_, { username, email, password }, ctx: Context) => {
        const hashedPassword = await hash(password);
        // TODO: zxcvbn password
        const user = await ctx.prisma.createUser({
          username: username.toLowerCase(),
          email,
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
  }
});
