import { Prisma } from './generated/prisma-client';

// TODO: Change in production!!
export const APP_SECRET =
  'xldjNnUWSKnBcnBuLBcghlzRBWf6slu9j8xiwTH1OWDkEhfWHTadrLG1or1v9qJE';

export interface Context {
  prisma: Prisma;
}
