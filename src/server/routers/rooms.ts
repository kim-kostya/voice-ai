import { eq } from "drizzle-orm";
import { AccessToken } from "livekit-server-sdk";
import { z } from "zod";
import { redis } from "@/lib/redis";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import {
  liveKitApiKey,
  liveKitApiSecret,
  liveKitWsUrl,
} from "@/server/livekit";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { DEFAULT_VOICE_ID } from "@/server/voices";

export const roomsRouter = createTRPCRouter({
  getRoomData: protectedProcedure
    .input(
      z.object({
        roomId: z.string().uuid(),
        timezoneOffset: z.number().int(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const accessTokenKey = `livekit:accessToken:${ctx.auth.userId}:${input.roomId}`;
      let accessToken = await redis.get<string>(accessTokenKey);

      if (!accessToken) {
        const currentVoiceIdResult = await db
          .select({ model: users.currentVoice })
          .from(users)
          .where(eq(users.id, ctx.auth.userId));

        const currentVoiceId =
          currentVoiceIdResult[0]?.model ?? DEFAULT_VOICE_ID;

        const accessTokenConfig = new AccessToken(
          liveKitApiKey,
          liveKitApiSecret,
          {
            identity: ctx.auth.userId,
            name: ctx.user?.fullName ?? "user",
            attributes: {
              timezone_offset: (input.timezoneOffset ?? 0).toString(),
              voice_id: currentVoiceId,
            },
          },
        );

        accessTokenConfig.addGrant({
          room: input.roomId,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
        });

        accessToken = await accessTokenConfig.toJwt();
        await redis.set(accessTokenKey, accessToken, {
          ex: 600,
        });
      }

      return {
        token: accessToken,
        wsUrl: liveKitWsUrl as string,
      };
    }),
});
