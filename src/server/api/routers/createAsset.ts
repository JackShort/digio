import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const createAssetRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .mutation(({ input }) => {
        return {
            asset: {
                name: input.title,
                id: 1,
            }
        }
    }),
});