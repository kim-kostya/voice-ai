import { AccessToken } from "livekit-server-sdk";
import { z } from "zod";
import { redis } from "@/lib/redis";
import {
  liveKitApiKey,
  liveKitApiSecret,
  liveKitWsUrl,
} from "@/server/livekit";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const roomsRouter = createTRPCRouter({
  getRoomData: protectedProcedure
    .input(
      z.object({
        roomId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const accessTokenKey = `livekit:accessToken:${ctx.auth.userId}:${input.roomId}`;
      let accessToken = await redis.get<string>(accessTokenKey);

      if (!accessToken) {
        const accessTokenConfig = new AccessToken(
          liveKitApiKey,
          liveKitApiSecret,
          {
            identity: ctx.auth.userId,
            name: ctx.user?.fullName ?? "user",
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
