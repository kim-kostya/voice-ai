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
          authorId: ctx.user.id,
        })
        .execute();
    }),
  getReminders: protectedProcedure.query(async () => {
    return await db.select().from(reminders).execute();
  }),
  checkReminders: publicProcedure.mutation(() => {}),
};
