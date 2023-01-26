import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const assetRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
        const { id } = input;
        return ctx.prisma.asset.findUnique({ where: {id}})
    }),
});