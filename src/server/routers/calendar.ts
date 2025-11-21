import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import { events } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const calendarRouter = createTRPCRouter({
  // Get all events for logged-in user
  getEvents: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    return db.select().from(events).where(eq(events.userId, ctx.user.id));
  }),

  // Add new event
  addEvent: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        date: z.string(),
        time: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) return;

      await db.insert(events).values({
        userId: ctx.user.id,
        title: input.title,
        date: input.date,
        time: input.time,
      });

      return { success: true };
    }),

  // Delete event
  deleteEvent: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.delete(events).where(eq(events.id, input.id));
      return { success: true };
    }),
});
