// src/server/index.ts

import { calendarRouter } from "@/server/routers/calendar"; // Google Calendar

import { remindersRouter } from "@/server/routers/reminders";
import { roomsRouter } from "@/server/routers/rooms";
import { createTRPCRouter } from "@/server/trpc";

// Combine all routers here
export const appRouter = createTRPCRouter({
  reminders: remindersRouter,
  rooms: roomsRouter, // delete if file missing
  calendar: calendarRouter, // added Google Calendar router
});

// TRPC type
export type AppRouter = typeof appRouter;
