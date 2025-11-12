"use client";

import {
  RoomAudioRenderer,
  RoomContext,
  useVoiceAssistant,
} from "@livekit/components-react";
import { Room, RoomEvent } from "livekit-client";
import { type ReactNode, useEffect, useState } from "react";
import { useLiveKit } from "@/lib/stores/livekit";
import { trpc } from "@/lib/trpc";

export function LiveKitRoom({ children }: { children: ReactNode }): ReactNode {
  const trpcUtils = trpc.useUtils();
  const { room, setRoom, volume, roomState, setRoomState } = useLiveKit();
  const [roomId, setRoomId] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    if (!room) return;

    const abortController = new AbortController();

    const connect = async () => {
      try {
        if (!roomId) return;
        if (!room) return;

        console.log("[LiveKit] Attempting to connect to room");
        setRoomState("connecting");
        const roomData = await trpcUtils.rooms.getRoomData.fetch({
          roomId: roomId as string,
          username: "user",
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

    connect().finally(() => {
      console.log("[LiveKit] Connecting to room");
    });

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
  const { setAgentState } = useLiveKit();
  const { state } = useVoiceAssistant();

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
