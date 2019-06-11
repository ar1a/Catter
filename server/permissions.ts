import { rule, shield } from 'graphql-shield';
import { Context, getUserId } from './utils';

const isAuthenticatedUser = rule()((_, __, ctx: Context) => {
  const userId = getUserId(ctx);
  return Boolean(userId);
});

const isMeowOwner = rule()(async (_, { id }, ctx: Context) => {
  const userId = getUserId(ctx);
  const author = await ctx.prisma.meow({ id }).author();

  return userId === author.id;
});

export default shield({
  Query: {
    me: isAuthenticatedUser
  },
  Mutation: {
    postMeow: isAuthenticatedUser,
    deleteMeow: isMeowOwner
  }
});
