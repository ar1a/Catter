import { prismaObjectType } from 'nexus-prisma';
import { Context } from '../utils';
import { RootValue } from 'nexus/dist/core';

export const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields(['id', 'username']);
    t.list.field('meows', {
      type: 'Meow',
      resolve: (parent: RootValue<'User'>, __, ctx: Context) =>
        ctx.prisma
          .user({ username: parent.username })
          .meows({ orderBy: 'createdAt_DESC' })
    });
  }
});
