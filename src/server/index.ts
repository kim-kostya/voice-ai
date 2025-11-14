// src/server/index.ts

import { createTRPCRouter } from "@/server/trpc";

// Import routers
import { exampleRouter } from "@/server/routers/example";
import { protectedRouter } from "@/server/routers/protected";
import { remindersRouter } from "@/server/routers/reminders";
import { roomsRouter } from "@/server/routers/rooms";        // keep only if exists
import { calendarRouter } from "@/server/routers/calendar";   // <-- GOOGLE CALENDAR

// Optional: User type for context (you had this)
export type User = {
  id: string;
};

// Root app router — MUST exist only once
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  reminders: remindersRouter,
  protected: protectedRouter,
  rooms: roomsRouter,        // remove if this file doesn't exist
  calendar: calendarRouter,  // <-- added Google Calendar router
});

// Export TRPC type for frontend
export type AppRouter = typeof appRouter;
