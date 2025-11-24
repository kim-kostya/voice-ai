// src/server/index.ts

import { remindersRouter } from "@/server/routers/reminders";
import { roomsRouter } from "@/server/routers/rooms";
import { voicesRouter } from "@/server/routers/voices";
import { createTRPCRouter } from "@/server/trpc";

export const appRouter = createTRPCRouter({
  reminders: remindersRouter,
  rooms: roomsRouter,
  voices: voicesRouter,
});

export type AppRouter = typeof appRouter;
