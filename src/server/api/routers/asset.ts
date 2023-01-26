import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const assetRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
        return ctx.prisma.asset.findUnique({ where: {slug: input.slug.toLowerCase()}})
    }),
});