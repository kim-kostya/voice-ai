"use client";

import { useRoomContext, useVoiceAssistant } from "@livekit/components-react";
import { type DependencyList, useCallback, useEffect } from "react";
import SuperJSON from "superjson";
import type { ZodTypeAny, z } from "zod";
import type { GeoLocation } from "@/lib/location";

export function useAgentRpcMethod<T extends ZodTypeAny>(
  rpcMethodName: string,
  inputSchema: T,
  callback: (data: z.infer<typeof inputSchema>) => Promise<AgentRPCMessage>,
  deps?: DependencyList,
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

    return () => {
      console.log(`[LiveKit RPC] Unregistering ${rpcMethodName} RPC method`);
      roomContext.unregisterRpcMethod(rpcMethodName);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: it's passed as parameter
  }, deps);
}

export function useAgentRemoteRpcMethod<
  TInput,
  TOutputSchema extends ZodTypeAny,
>(
  name: string,
  outputSchema: TOutputSchema,
): (input: TInput) => Promise<z.infer<TOutputSchema>> {
  const roomContext = useRoomContext();
  const { agent } = useVoiceAssistant();

  // biome-ignore lint/correctness/useExhaustiveDependencies: no need to recalculate on roomContext or outputSchema change
  return useCallback<z.infer<TOutputSchema>>(
    async (input: TInput) => {
      const payload = SuperJSON.stringify(input);
      const response = await roomContext.localParticipant.performRpc({
        method: name,
        payload,
        destinationIdentity: agent?.identity ?? "agent",
      });
      const parsedResponse = SuperJSON.parse(response);
      const validatedResponse = outputSchema.safeParse(parsedResponse);

      if (!validatedResponse.success) {
        throw new Error(
          `Invalid response from ${name}: ${JSON.stringify(validatedResponse.error)}`,
        );
      }

      return validatedResponse.data;
    },
    [name, agent?.identity],
  );
}

export interface AgentRPCMessageBase {
  type: string;
}

export interface AgentRPCSuccess extends AgentRPCMessageBase {
  type: "success";
}

export interface ReminderRPCMessage extends AgentRPCMessageBase {
  type: "reminder";
  time: Date;
  text: string;
}

export interface RemindersWithIdRPCMessage extends AgentRPCMessageBase {
  type: "reminders_with_id";
  reminders: {
    id: number;
    time: Date;
    text: string;
  }[];
}

export interface GeoLocationRPCMessage {
  type: "geo_location";
  location: GeoLocation;
}

export interface AgentRPCError {
  type: "error";
  message: string;
}

export type AgentRPCMessage =
  | ReminderRPCMessage
  | RemindersWithIdRPCMessage
  | GeoLocationRPCMessage
  | AgentRPCSuccess
  | AgentRPCError;
