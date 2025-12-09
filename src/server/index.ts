import { pushRouter } from "@/server/routers/push";
import { remindersRouter } from "@/server/routers/reminders";
import { roomsRouter } from "@/server/routers/rooms";
import { voicesRouter } from "@/server/routers/voices";
import { createTRPCRouter } from "@/server/trpc";

export const appRouter = createTRPCRouter({
  reminders: remindersRouter,
  rooms: roomsRouter,
  voices: voicesRouter,
  push: pushRouter,
});

export type AppRouter = typeof appRouter;
