import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { db } from "@/server/db";
import { events } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const calendarRouter = createTRPCRouter({
  // Get all events for logged-in user
  getEvents: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(events)
      .where(eq(events.userId, ctx.user!.id));
  }),

  // Add new event
  addEvent: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        date: z.string(),
        time: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.insert(events).values({
        userId: ctx.user!.id,
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
      })
    )
    .mutation(async ({ input }) => {
      await db.delete(events).where(eq(events.id, input.id));
      return { success: true };
    }),
});
