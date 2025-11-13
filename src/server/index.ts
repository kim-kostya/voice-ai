import { exampleRouter } from "@/server/routers/example";
import { protectedRouter } from "@/server/routers/protected";
import { remindersRouter } from "@/server/routers/reminders";
import { roomsRouter } from "@/server/routers/rooms";
import { createTRPCRouter } from "@/server/trpc";

// Combine all routers here
export const appRouter = createTRPCRouter({
  rooms: roomsRouter,
  reminders: remindersRouter,
  example: exampleRouter,
  protected: protectedRouter,
});

export type AppRouter = typeof appRouter;
