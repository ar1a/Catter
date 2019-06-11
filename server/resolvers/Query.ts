import { prismaObjectType } from 'nexus-prisma';
import { Context, getUserId } from '../utils';

export const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.prismaFields(['meow', 'user']);
    t.list.field('feed', {
      type: 'Meow',
      resolve: (_, __, ctx: Context) =>
        ctx.prisma.meows({ orderBy: 'createdAt_DESC' })
    });

    t.field('me', {
      type: 'User',
      resolve: (_, __, ctx: Context) => {
        const id = getUserId(ctx);
        return ctx.prisma.user({ id });
      }
    });
  }
});
