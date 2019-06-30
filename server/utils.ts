import { verify } from 'jsonwebtoken';

import { Prisma } from './generated/prisma-client';

// TODO: Change in production!!
export const APP_SECRET =
  'xldjNnUWSKnBcnBuLBcghlzRBWf6slu9j8xiwTH1OWDkEhfWHTadrLG1or1v9qJE';

export function getUserId(ctx: Context) {
  const Authorization = ctx.request.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const verifiedToken = verify(token, APP_SECRET) as Token;
    return verifiedToken && verifiedToken.userId;
  }

  throw new Error('Unauthorized! This should be unreachable.');
}

interface Token {
  userId: string;
}

export interface Context {
  prisma: Prisma;
  request: any;
}
