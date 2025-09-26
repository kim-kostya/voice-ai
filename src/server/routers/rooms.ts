import { AccessToken } from "livekit-server-sdk";
import { z } from "zod";
import { redis } from "@/lib/redis";
import {
  liveKitApiKey,
  liveKitApiSecret,
  liveKitWsUrl,
} from "@/server/livekit";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";

export const roomsRouter = createTRPCRouter({
  getRoomData: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        roomId: z.string().uuid(),
        username: z.string(),
      }),
    )
    .query(async ({ input }) => {
      let accessToken = await redis.get<string>(
        `livekit:accessToken:${input.userId}:${input.roomId}`,
      );

      if (!accessToken) {
        const accessTokenConfig = new AccessToken(
          liveKitApiKey,
          liveKitApiSecret,
          {
            identity: input.username,
          },
        );

        accessTokenConfig.addGrant({
          room: input.roomId,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
        });

        accessToken = await accessTokenConfig.toJwt();
        await redis.set(`livekit:accessToken:${input.userId}`, accessToken, {
          ex: 600,
        });
      }

      return {
        token: accessToken,
        wsUrl: liveKitWsUrl as string,
      };
    }),
});
