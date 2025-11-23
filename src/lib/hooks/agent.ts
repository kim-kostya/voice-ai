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
  TInputSchema extends ZodTypeAny,
  TOutputSchema extends ZodTypeAny,
>(
  name: string,
  inputSchema: TInputSchema,
  outputSchema: TOutputSchema,
): (input: z.infer<TInputSchema>) => Promise<z.infer<TOutputSchema>> {
  const roomContext = useRoomContext();
  const { agent } = useVoiceAssistant();

  // biome-ignore lint/correctness/useExhaustiveDependencies: no need to recalculate on roomContext or outputSchema change
  return useCallback<z.infer<TOutputSchema>>(
    async (input: z.infer<TInputSchema>) => {
      const validatedInput = inputSchema.parse(input);
      const payload = SuperJSON.stringify(validatedInput);
      const response = await roomContext.localParticipant.performRpc({
        method: name,
        payload,
        destinationIdentity: agent?.identity ?? "agent",
      });
      const parsedResponse = SuperJSON.parse(response);
      return outputSchema.parse(parsedResponse);
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
