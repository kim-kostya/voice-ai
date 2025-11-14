// src/server/index.ts

import { createTRPCRouter } from "@/server/trpc";

// Import routers
import { exampleRouter } from "@/server/routers/example";
import { protectedRouter } from "@/server/routers/protected";
import { remindersRouter } from "@/server/routers/reminders";
import { roomsRouter } from "@/server/routers/rooms";        // remove if it doesn't exist
import { calendarRouter } from "@/server/routers/calendar";  // Google Calendar

// Optional: User type for context
export type User = {
  id: string;
};

// Root app router — must exist only once
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  reminders: remindersRouter,
  protected: protectedRouter,
  rooms: roomsRouter,        // delete if file missing
  calendar: calendarRouter,  // added Google Calendar router
});

// TRPC type
export type AppRouter = typeof appRouter;
