import { createTRPCRouter } from "./trpc";
import { createAssetRouter } from "./routers/createAsset";
import { presignedUrlRouter } from "./routers/presignedUrl";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  createAsset: createAssetRouter,
  presignedUrl: presignedUrlRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
