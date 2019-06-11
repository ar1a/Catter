import { rule, shield } from 'graphql-shield';
import { Context, getUserId } from './utils';

const isAuthenticatedUser = rule()((_, __, ctx: Context) => {
  const userId = getUserId(ctx);
  return Boolean(userId);
});

export default shield({
  Query: {
    me: isAuthenticatedUser
  },
  Mutation: {
    postMeow: isAuthenticatedUser
  }
});
