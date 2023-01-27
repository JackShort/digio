import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const createAssetRouter = createTRPCRouter({
  create: publicProcedure
    .input( z.object({
        name: z.string(),
        description: z.string(),
        slug: z.string(),
        projectId: z.string(),
        creator: z.string(),
        priceInWei: z.string(),
        headerImageKey: z.string().nullable(),
        footerImageKey: z.string().nullable(),
        backgroundColor: z.string().nullable(),
        textColor: z.string().nullable(),
        accentColor: z.string().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const asset = {
        name: input.name,
        description: input.description,
        slug: input.slug,
        projectId: input.projectId,
        createdBy: input.creator,
        priceInWei: input.priceInWei,
        headerImageKey: input.headerImageKey,
        footerImageKey: input.footerImageKey,
        backgroundColor: input.backgroundColor ?? undefined,
        textColor: input.textColor ?? undefined,
        accentColor: input.accentColor ?? undefined,
      }

      return ctx.prisma.asset.create({ data: asset })
    }),
});