// src/server/routers/calendar.ts

import { z } from "zod";
import { createSimpleEvent, listUpcomingEvents } from "../google/calendar";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// NOTE: for now we pass accessToken from the client.
// Later, you can change this to read from ctx (e.g. from DB/Clerk user metadata).
export const calendarRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const events = await listUpcomingEvents(input.accessToken);
      return events;
    }),

  create: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        summary: z.string().min(1),
        description: z.string().optional(),
        start: z.string(), // ISO string
        end: z.string(), // ISO string
      }),
    )
    .mutation(async ({ input }) => {
      const event = await createSimpleEvent({
        accessToken: input.accessToken,
        summary: input.summary,
        description: input.description,
        start: input.start,
        end: input.end,
      });
      return event;
    }),
});
