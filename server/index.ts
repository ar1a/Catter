import { prisma } from './generated/prisma-client';
import datamodelInfo from './generated/nexus-prisma';
import * as path from 'path';
import { stringArg } from 'nexus';
import * as allTypes from './resolvers';
import { prismaObjectType, makePrismaSchema } from 'nexus-prisma';
import { GraphQLServer } from 'graphql-yoga';
import permissions from './permissions';

const schema = makePrismaSchema({
  types: allTypes,
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
  middlewares: [permissions],
  context: request => ({ prisma, ...request })
});

server.start(() => console.log('Server running on http://localhost:4000'));
