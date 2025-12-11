import { z } from "zod";
import { db } from "@/server/db";
import { pushSubscriptions } from "@/server/db/schema";
import { sendPushNotification } from "@/server/push";
import { protectedProcedure } from "@/server/trpc";

export const pushRouter = {
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db.insert(pushSubscriptions).values({
        userId: ctx.auth.userId,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
      });
    }),
  sendTestNotification: protectedProcedure.mutation(async ({ ctx }) => {
    await sendPushNotification(
      {
        type: "test",
        title: "Test notification",
        body: "Test notification",
      },
      ctx.auth.userId,
    );
  }),
};
