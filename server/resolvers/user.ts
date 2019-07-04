import { prismaObjectType } from 'nexus-prisma';
import { RootValue } from 'nexus/dist/core';

import { Context } from '../utils';

export const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields(['id', 'username']);
    t.list.field('meows', {
      type: 'Meow',
      resolve: (parent: RootValue<'User'>, __, ctx: Context) =>
        ctx.prisma.user({ id: parent.id }).meows({ orderBy: 'createdAt_DESC' })
    });
    t.list.field('likes', {
      type: 'Meow',
      resolve: (parent: RootValue<'User'>, __, ctx: Context) =>
        ctx.prisma.user({ id: parent.id }).likes({ orderBy: 'createdAt_DESC' })
    });
  }
});
