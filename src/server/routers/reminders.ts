import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { reminders } from "@/server/db/schema";
import { protectedProcedure, publicProcedure } from "@/server/trpc";

export const remindersRouter = {
  addReminder: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        time: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .insert(reminders)
        .values({
          text: input.text,
          time: input.time.toISOString(),
          authorId: ctx.auth.userId,
        })
        .execute();
    }),
  removeReminder: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.id, input.id),
            eq(reminders.authorId, ctx.auth.userId),
          ),
        )
        .execute();

      if (result.length === 0) {
        throw new Error("Reminder not found");
      }

      if (result[0].authorId !== ctx.auth.userId) {
        throw new Error("Unauthorized");
      }

      await db.delete(reminders).where(eq(reminders.id, input.id)).execute();
    }),
  getReminders: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select()
      .from(reminders)
      .where(eq(reminders.authorId, ctx.auth.userId))
      .execute();
    return result.map((reminder) => ({
      id: reminder.id,
      text: reminder.text,
      time: new Date(reminder.time),
    }));
  }),
  checkReminders: publicProcedure.mutation(() => {}),
};
