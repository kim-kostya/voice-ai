import { roomsRouter } from "@/server/routers/rooms";
import { exampleRouter } from "@/server/routers/test";
import { createTRPCRouter } from "@/server/trpc";

export const appRouter = createTRPCRouter({
  rooms: roomsRouter,
});

export type AppRouter = typeof appRouter;
