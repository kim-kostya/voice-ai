"use client";

import { RoomAudioRenderer, RoomContext } from "@livekit/components-react";
import { Room } from "livekit-client";
import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { ChatHistoryPopover } from "@/components/ui/ChatHistoryPopover";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import VoiceButton from "@/components/ui/VoiceButton";
import { VolumeControlPopover } from "@/components/ui/VolumeControlPopover";
import VoiceAIAgent from "@/components/VoiceAIAgent";
import { trpc } from "@/lib/trpc";

export function VoiceAIAgentContainer() {
  const trpcUtils = trpc.useUtils();
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [isRoomConnected, setIsRoomConnected] = useState(false);
  const [isRoomConnecting, setIsRoomConnecting] = useState(false);
  const [roomConnectionError, setRoomConnectionError] = useState<
    Error | undefined
  >(undefined);
  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      }),
  );
  const [audioLevel, setAudioLevel] = useLocalStorage("audio_volume", 50);

  const connectToRoom = async () => {
    try {
      setRoomConnectionError(undefined);
      setIsRoomConnecting(true);
      let currentRoomId = roomId;
      if (!currentRoomId) {
        currentRoomId = crypto.randomUUID();
        setRoomId(currentRoomId);
      }
      const roomData = await trpcUtils.rooms.getRoomData.fetch({
        roomId: currentRoomId,
        username: "user",
      });

      await roomInstance.connect(roomData.wsUrl, roomData.token);
      await roomInstance.startAudio();
      await roomInstance.localParticipant.setMicrophoneEnabled(true);
      setIsRoomConnected(true);
    } catch (error) {
      setRoomConnectionError(error as Error);
    } finally {
      setIsRoomConnecting(false);
    }
  };

  if (isRoomConnecting) {
    return (
      <div className="w-32 h-32 flex items-center justify-center rounded-full bg-teal-600">
        <LoadingSpinner />
      </div>
    );
  }
  if (!isRoomConnected) {
    return (
      <div className="flex flex-col items-center gap-8">
        <VoiceButton
          onClick={connectToRoom}
          isDisabled={isRoomConnecting}
          isMuted={false}
        />
        {(roomConnectionError && <p>{roomConnectionError.message}</p>) ||
          (isRoomConnecting && <p>Connecting...</p>) || (
            <p>Connect to a room to start using the AI assistant</p>
          )}
      </div>
    );
  }

  return (
    <RoomContext.Provider value={roomInstance}>
      <div className="flex flex-col items-center gap-8">
        <VoiceAIAgent />
        <RoomAudioRenderer volume={audioLevel / 100} />
        <div className="flex flex-row items-center gap-8">
          <VolumeControlPopover
            audioLevel={audioLevel}
            setAudioLevel={setAudioLevel}
          />
          <ChatHistoryPopover />
        </div>
      </div>
    </RoomContext.Provider>
  );
}
