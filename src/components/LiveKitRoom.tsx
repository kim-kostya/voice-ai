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
    if (!room) {
      setRoom(
        new Room({
          dynacast: true,
          adaptiveStream: true,
        }),
      );
    }

    if (!roomId) {
      setRoomId(crypto.randomUUID());
    }
  });

  useEffect(() => {
    if (!room) return;
    if (!roomId) return;

    const abortController = new AbortController();

    const onConnected = () => setRoomState("connected");
    const onDisconnected = () => {
      setRoomState("disconnected");
      setTimeout(connect, 10000, abortController.signal);
    };

    const connect = async () => {
      try {
        setRoomState("connecting");
        const roomData = await trpcUtils.rooms.getRoomData.fetch({
          roomId: roomId as string,
          username: "user",
        });
        await room.connect(roomData.wsUrl, roomData.token);
      } catch (error) {
        console.error("Failed to reconnect to room:", error);
        setRoomState("failed");
      }
    };

    room.on(RoomEvent.Connected, onConnected);
    room.on(RoomEvent.Disconnected, onDisconnected);

    abortController.abort();

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
        setAgentState("connecting");
        break;
      case "listening":
        setAgentState("listening");
        break;
      case "disconnected":
        setAgentState("disconnected");
        break;
      case "thinking":
        setAgentState("thinking");
        break;
      case "initializing":
        setAgentState("connecting");
        break;
      case "speaking":
        setAgentState("speaking");
        break;
      default:
        setAgentState("disconnected");
        break;
    }
  }, [state, setAgentState]);

  return <div style={{ display: "none" }}></div>;
}
