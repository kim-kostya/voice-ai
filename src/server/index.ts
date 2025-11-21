import { calendarRouter } from "@/server/routers/calendar";
import { googleCalendarRouter } from "@/server/routers/googleCalendar"; // optional Google Calendar router
import { remindersRouter } from "@/server/routers/reminders";
import { roomsRouter } from "@/server/routers/rooms";
import { createTRPCRouter } from "@/server/trpc";

export const appRouter = createTRPCRouter({
  reminders: remindersRouter,
  rooms: roomsRouter,
  calendar: calendarRouter, // Local DB calendar
  googleCalendar: googleCalendarRouter, // Google Calendar support
});

export type AppRouter = typeof appRouter;
