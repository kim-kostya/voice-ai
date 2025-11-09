import { useLocalParticipant } from "@livekit/components-react";
import { Mic, MicOff } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useLiveKit } from "@/lib/stores/livekit";
import { cn } from "@/lib/utils";

export default function VoiceButton() {
  const { roomState, agentState } = useLiveKit();
  const { localParticipant } = useLocalParticipant();

  const isMuted = !localParticipant.isMicrophoneEnabled;
  const isError = roomState === "failed" || agentState === "failed";

  return (
    <div
      className={cn("w-32 h-32 flex items-center justify-center rounded-full")}
    >
      <button
        className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-lg",
          isError
            ? "bg-red-600 hover:bg-red-700 disabled:bg-red-600"
            : "bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600",
        )}
        type="button"
        disabled={isMuted}
        onClick={async () => {
          await localParticipant.setMicrophoneEnabled(
            !localParticipant.isMicrophoneEnabled,
          );
        }}
      >
        <VoiceButtonIcon
          isMuted={isMuted}
          roomState={roomState}
          agentState={agentState}
        />
      </button>
    </div>
  );
}

function VoiceButtonIcon({
  isMuted,
  roomState,
  agentState,
}: {
  isMuted: boolean;
  roomState: string;
  agentState: string;
}) {
  if (roomState === "connecting" || agentState === "connecting") {
    return <LoadingSpinner className="w-8 h-8 text-white" />;
  }

  if (
    roomState === "disconnected" ||
    agentState === "disconnected" ||
    roomState === "failed" ||
    agentState === "failed"
  ) {
    return <MicOff className="w-8 h-8 text-white" />;
  }

  if (isMuted) {
    return <MicOff className="w-8 h-8 text-white" />;
  } else {
    return <Mic className="w-8 h-8 text-white" />;
  }
}
