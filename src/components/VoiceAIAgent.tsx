"use client";

import "@livekit/components-styles";
import { useRoomContext, useVoiceAssistant } from "@livekit/components-react";
import VoiceButton from "@/components/ui/VoiceButton";

export default function VoiceAIAgent() {
  const roomContext = useRoomContext();
  const { state } = useVoiceAssistant();

  return (
    <>
      <VoiceButton
        onClick={async () =>
          await roomContext.localParticipant.setMicrophoneEnabled(
            !roomContext.localParticipant.isMicrophoneEnabled,
          )
        }
        isDisabled={
          state === "disconnected" ||
          state === "connecting" ||
          state === "initializing"
        }
        isMuted={!roomContext.localParticipant.isMicrophoneEnabled}
      />
      <p className="text-center">{state}</p>
    </>
  );
}
