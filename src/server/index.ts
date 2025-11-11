import { remindersRouter } from "@/server/routers/reminders";
import { roomsRouter } from "@/server/routers/rooms";
import { exampleRouter } from "@/server/routers/example";
import { protectedRouter } from "@/server/routers/protected";
import { createTRPCRouter } from "@/server/trpc";

// User type for context
export type User = {
  id: string;
};

// Combine all routers here
export const appRouter = createTRPCRouter({
  rooms: roomsRouter,
  reminders: remindersRouter,
  example: exampleRouter,
  protected: protectedRouter,
});

export type AppRouter = typeof appRouter;
