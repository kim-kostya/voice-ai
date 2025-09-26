"use client";

import { RoomAudioRenderer, RoomContext } from "@livekit/components-react";
import { useQuery } from "@tanstack/react-query";
import { Room } from "livekit-client";
import { useState } from "react";
import VoiceAIAgent from "@/components/VoiceAIAgent";
import { trpc } from "@/lib/trpc";
import { useLocalStorage } from "@/lib/utils";

export function VoiceAIAgentContainer() {
  const [userId] = useLocalStorage("user_id", crypto.randomUUID());
  const [roomId] = useLocalStorage("room_id", crypto.randomUUID());

  const username = "User";
  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      }),
  );

  const [roomData, roomDataResult] = trpc.rooms.getRoomData.useSuspenseQuery({
    userId,
    roomId,
    username,
  });

  const { isLoading: isRoomConnecting, isError: isRoomConnectingError } =
    useQuery({
      queryKey: ["roomConnect", roomId, username, roomData?.token],
      queryFn: async () => {
        if (!roomData) return;
        await roomInstance.connect(roomData.wsUrl, roomData.token);
        await roomInstance.localParticipant.setMicrophoneEnabled(true);

        return {};
      },
    });

  if (roomDataResult.isError) {
    return <div>Error: {roomDataResult.error.message}</div>;
  }

  if (isRoomConnectingError) {
    return <div>Error connecting to room</div>;
  }

  if (isRoomConnecting) {
    return <div>Connecting to room...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p>RoomId: {roomId}</p>
      {roomData && (
        <RoomContext.Provider value={roomInstance}>
          <div className="flex flex-col items-center gap-8">
            <VoiceAIAgent />
            <RoomAudioRenderer />
          </div>
        </RoomContext.Provider>
      )}
    </div>
  );
}
