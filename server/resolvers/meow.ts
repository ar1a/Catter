import { prismaObjectType } from 'nexus-prisma';
import { RootValue } from 'nexus/dist/core';

import { Context } from '../utils';

export const Meow = prismaObjectType({
  name: 'Meow',
  definition(t) {
    t.prismaFields(['id', 'content', 'author', 'createdAt']);
    t.list.field('likedBy', {
      type: 'User',
      resolve: (parent: RootValue<'Meow'>, __, ctx: Context) =>
        ctx.prisma.meow({ id: parent.id }).likedBy()
    });
  }
});
