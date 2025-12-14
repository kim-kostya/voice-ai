"use client";

import {
  RoomAudioRenderer,
  RoomContext,
  useVoiceAssistant,
} from "@livekit/components-react";
import { Room, RoomEvent } from "livekit-client";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { z } from "zod";
import { useAgentRpcMethod } from "@/lib/hooks/agent";
import { getLocation } from "@/lib/location";
import { useLiveKit } from "@/lib/stores/livekit";
import { trpc } from "@/lib/trpc";

export function LiveKitRoom({ children }: { children: ReactNode }): ReactNode {
  const trpcUtils = trpc.useUtils();
  const { room, volume, roomState, setRoom, setRoomState, setVoiceId } =
    useLiveKit();
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("[LiveKit] Initializing room");
    if (!room) {
      setRoom(
        new Room({
          dynacast: true,
          adaptiveStream: true,
          audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        }),
      );
    }

    if (!roomId) {
      setRoomId(crypto.randomUUID());
    }
  }, [room, setRoom, roomId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: roomState is only used for checks
  useEffect(() => {
    if (!room) return;

    const abortController = new AbortController();

    const connect = async () => {
      try {
        if (!roomId) return;
        if (!room) return;

        if (roomState === "connected") {
          console.log("[LiveKit] Room is already connected");
          return;
        }

        console.log("[TRPC] Retrieving current voice ID");
        const voiceId = await trpcUtils.voices.getCurrentVoice.fetch();
        setVoiceId(voiceId);
        console.log("[TRPC] Current voice ID retrieved:", voiceId);

        const reminderId = searchParams.get("reminder_id");

        if (reminderId) {
          console.log("[TRPC] Setting initial reminder ID to:", reminderId);
        }

        console.log("[LiveKit] Attempting to connect to room");
        setRoomState("connecting");
        const roomData = await trpcUtils.rooms.getRoomData.fetch({
          roomId: roomId as string,
          timezoneOffset: new Date().getTimezoneOffset(),
          initialReminderId: reminderId ? parseInt(reminderId, 10) : undefined,
        });
        await room.connect(roomData.wsUrl, roomData.token);
      } catch (error) {
        console.error("[LiveKit] Failed to connect to room:", error);
        setRoomState("failed");
        setTimeout(connect, 10000, abortController.signal);
      }
    };

    const onConnected = () => {
      console.log("[LiveKit] Room connected");
      setRoomState("connected");
    };

    const onDisconnected = () => {
      console.log("[LiveKit] Room disconnected");
      setRoomState("disconnected");
      setTimeout(connect, 10000, abortController.signal);
    };

    room.on(RoomEvent.Connected, onConnected);
    room.on(RoomEvent.Disconnected, onDisconnected);

    // noinspection JSIgnoredPromiseFromCall
    connect();

    return () => {
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.Disconnected, onDisconnected);
      abortController.abort();
    };
  }, [room, roomId, setRoomState, trpcUtils.rooms.getRoomData]);

  if (!room) {
    return <p>Loading...</p>;
  }

  return (
    <RoomContext.Provider value={room}>
      {children}
      <RoomAudioRenderer volume={volume / 100.0} />
      {roomState === "connected" && <LiveKitAgent />}
    </RoomContext.Provider>
  );
}

function LiveKitAgent() {
  const { setAgentState, setAgent } = useLiveKit();
  const { state, agent } = useVoiceAssistant();
  const trpcUtils = trpc.useUtils();
  const addReminder = trpc.reminders.addReminder.useMutation();
  const removeReminder = trpc.reminders.removeReminder.useMutation();

  useEffect(() => {
    if (!agent) return;
    setAgent(agent);
  }, [agent, setAgent]);

  useAgentRpcMethod(
    "get_current_voice",
    z.object({}),
    async () => {
      const voiceId = await trpcUtils.voices.getCurrentVoice.fetch();

      return {
        type: "current_voice",
        voiceId,
      };
    },
    [],
  );

  useAgentRpcMethod(
    "get_location",
    z.object({}),
    async () => {
      const location = await getLocation();

      return {
        type: "geo_location",
        location,
      };
    },
    [],
  );

  useAgentRpcMethod(
    "add_reminder",
    z.object({ text: z.string(), time: z.string() }),
    async (data) => {
      await addReminder.mutateAsync({
        text: data.text,
        time: new Date(data.time),
      });

      return {
        type: "success",
      };
    },
    [],
  );

  useAgentRpcMethod(
    "remove_reminder",
    z.object({ id: z.number().int().positive() }),
    async (data) => {
      await removeReminder.mutateAsync({ id: data.id });

      return {
        type: "success",
      };
    },
    [],
  );

  useAgentRpcMethod(
    "get_reminders",
    z.object({}),
    async () => {
      const reminders = await trpcUtils.reminders.getReminders.fetch();
      return {
        type: "reminders_with_id",
        reminders,
      };
    },
    [],
  );

  useEffect(() => {
    switch (state) {
      case "connecting":
        console.log("[LiveKit] Connecting to agent");
        setAgentState("connecting");
        break;
      case "initializing":
        console.log("[LiveKit] Initializing agent");
        setAgentState("connecting");
        break;
      case "disconnected":
        console.log("[LiveKit] Agent is disconnected");
        setAgentState("disconnected");
        break;
      case "listening":
        console.log("[LiveKit] Agent is listening");
        setAgentState("listening");
        break;
      case "thinking":
        console.log("[LiveKit] Agent is thinking");
        setAgentState("thinking");
        break;
      case "speaking":
        console.log("[LiveKit] Agent is speaking");
        setAgentState("speaking");
        break;
      default:
        console.log("[LiveKit] Unknown agent state received");
        setAgentState("failed");
        break;
    }
  }, [state, setAgentState]);

  return <div style={{ display: "none" }}></div>;
}
