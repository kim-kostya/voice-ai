import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VoiceButton({
  onClick,
  isDisabled,
  isMuted,
  ...props
}: {
  onClick: () => void;
  isDisabled: boolean;
  isMuted: boolean;
}) {
  return (
    <div
      className={cn("w-32 h-32 flex items-center justify-center rounded-full")}
    >
      <button
        className={cn(
          "w-32 h-32 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center transition-all shadow-lg disabled:bg-gray-600",
          isMuted && "bg-gray-600 hover:bg-gray-700",
        )}
        type="button"
        disabled={isDisabled}
        onClick={onClick}
        {...props}
      >
        {isMuted && <MicOff className="w-8 h-8 text-white" />}
        {!isMuted && <Mic className="w-8 h-8 text-white" />}
      </button>
    </div>
  );
}
