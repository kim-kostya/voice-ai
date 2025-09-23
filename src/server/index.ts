import {createTRPCRouter} from '@/server/trpc';
import {exampleRouter} from '@/server/routers/test';

export const appRouter = createTRPCRouter({
  example: exampleRouter,
});

export type AppRouter = typeof appRouter;