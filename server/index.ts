import { prisma } from './generated/prisma-client';
import datamodelInfo from './generated/nexus-prisma';
import * as path from 'path';
import { stringArg } from 'nexus';
import { prismaObjectType, makePrismaSchema } from 'nexus-prisma';
import { GraphQLServer } from 'graphql-yoga';

const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.prismaFields(['meow', 'user']);
    t.list.field('feed', {
      type: 'Meow',
      resolve: (_, __, ctx) => ctx.prisma.meows()
    });
  }
});

const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields(['id', 'username', 'meows']);
  }
});

const schema = makePrismaSchema({
  types: [Query, User],
  prisma: {
    datamodelInfo,
    client: prisma
  },
  outputs: {
    schema: path.join(__dirname, './generated/schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts')
  }
});

const server = new GraphQLServer({
  schema,
  context: { prisma }
});

server.start(() => console.log('Server running on http://localhost:4000'));
