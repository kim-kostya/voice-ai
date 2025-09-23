import { exampleRouter } from "@/server/routers/test";
import { createTRPCRouter } from "@/server/trpc";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
});

export type AppRouter = typeof appRouter;
