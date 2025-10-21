"use client";

import { useRoomContext } from "@livekit/components-react";
import { useEffect } from "react";
import SuperJSON from "superjson";
import type { ZodTypeAny, z } from "zod";
import type { AgentRPCError, AgentRPCMessage, GeoLocation } from "@/lib/models";

// Returns the user's current location or uses ip location
export function getLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        fetch("https://ipapi.co/json/")
          .then((res) =>
            res
              .json()
              .then((data) =>
                resolve({
                  latitude: data.latitude,
                  longitude: data.longitude,
                }),
              )
              .catch(() => reject("Failed to fetch location")),
          )
          .catch(() => reject("Failed to fetch location"));
      },
    );
  });
}

export function useAgentRpcMethod<T extends ZodTypeAny>(
  rpcMethodName: string,
  inputSchema: T,
  callback: (data: z.infer<typeof inputSchema>) => Promise<AgentRPCMessage>,
) {
  const roomContext = useRoomContext();

  useEffect(() => {
    if (!roomContext) return;

    console.log(`[LiveKit RPC] Registering ${rpcMethodName} RPC method`);

    roomContext.unregisterRpcMethod(rpcMethodName);
    roomContext.registerRpcMethod(rpcMethodName, async (data) => {
      try {
        console.log(`[LiveKit RPC] ${rpcMethodName} called with data:`, data);
        const rawRequest = SuperJSON.parse(data.payload);
        const request = inputSchema.safeParse(rawRequest);
        return SuperJSON.stringify(await callback(request));
        // biome-ignore lint/suspicious/noExplicitAny: catches all errors that might occur
      } catch (error: any) {
        const message = Object.hasOwn(error, "message") ? error.message : error;

        console.log(
          `[LiveKit RPC] ${rpcMethodName} failed with error: ${message}`,
        );
        return SuperJSON.stringify({
          type: "error",
          message: message,
        } as AgentRPCError);
      }
    });
  }, [rpcMethodName, inputSchema, roomContext, callback]);

  return () => {
    roomContext.unregisterRpcMethod(rpcMethodName);
  };
}
