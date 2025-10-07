import { roomsRouter } from "@/server/routers/rooms";
import { createTRPCRouter } from "@/server/trpc";

export type User = {
  id: string;
};

export const appRouter = createTRPCRouter({
  rooms: roomsRouter,
});

export type AppRouter = typeof appRouter;
