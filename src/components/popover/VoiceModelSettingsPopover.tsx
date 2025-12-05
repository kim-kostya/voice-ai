import { CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import VoiceModelSettings from "@/components/VoiceModelSettings";

export function VoiceModelSettingsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg bg-transparent"
        >
          <CircleUserRound className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="center" side="top">
        <VoiceModelSettings />
      </PopoverContent>
    </Popover>
  );
}
