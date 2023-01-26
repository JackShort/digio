import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const createAssetRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        hash: z.string(),
        creator: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const asset = {
        name: input.name,
        hash: input.hash,
        createdBy: input.creator,
      }

      return ctx.prisma.asset.create({ data: asset })
    }),
});