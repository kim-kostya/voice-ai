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
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let accessToken = await redis.get<string>(
        `livekit:accessToken:${ctx.user.id}:${input.roomId}`,
      );

      if (!accessToken) {
        const accessTokenConfig = new AccessToken(
          liveKitApiKey,
          liveKitApiSecret,
          {
            identity: ctx.user.id,
            name: input.username,
          },
        );

        accessTokenConfig.addGrant({
          room: input.roomId,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
        });

        accessToken = await accessTokenConfig.toJwt();
        await redis.set(
          `livekit:accessToken:${ctx.user.id}:${input.roomId}`,
          accessToken,
          {
            ex: 600,
          },
        );
      }

      return {
        token: accessToken,
        wsUrl: liveKitWsUrl as string,
      };
    }),
});
