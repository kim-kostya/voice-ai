"use client";

import { useRoomContext } from "@livekit/components-react";
import { useEffect } from "react";
import SuperJSON from "superjson";
import type { ZodTypeAny, z } from "zod";
import type { AgentRPCError, AgentRPCMessage } from "@/lib/models";

export function useAgentRpcMethod<T extends ZodTypeAny>(
  rpcMethodName: string,
  inputSchema: T,
  callback: (data: z.infer<typeof inputSchema>) => Promise<AgentRPCMessage>,
) {
  const roomContext = useRoomContext();

  // biome-ignore lint/correctness/useExhaustiveDependencies: no need to add roomContext to dependencies
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
  }, [rpcMethodName, roomContext, callback]);

  return () => {
    console.log(`[LiveKit RPC] Unregistering ${rpcMethodName} RPC method`);
    roomContext.unregisterRpcMethod(rpcMethodName);
  };
}
