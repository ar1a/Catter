import { prismaObjectType } from 'nexus-prisma';
import { Context } from '../utils';

export const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.prismaFields(['meow', 'user']);
    t.list.field('feed', {
      type: 'Meow',
      resolve: (_, __, ctx: Context) => ctx.prisma.meows()
    });
  }
});
