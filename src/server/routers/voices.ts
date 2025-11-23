import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { DEFAULT_VOICE_ID, voices } from "@/server/voices";

export const voicesRouter = createTRPCRouter({
  getVoices: protectedProcedure.query(() => voices),
  getCurrentVoice: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select({ voiceId: users.currentVoice })
      .from(users)
      .where(eq(users.id, ctx.auth.userId));

    if (result.length === 0 || !result[0].voiceId) {
      return DEFAULT_VOICE_ID;
    }

    return result[0].voiceId;
  }),
  setCurrentVoice: protectedProcedure
    .input(z.object({ voiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(users)
        .set({ currentVoice: input.voiceId })
        .where(eq(users.id, ctx.auth.userId));
    }),
});
