import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Slider } from "@/components/ui/Slider";

export function VolumeControlPopover({
  audioLevel,
  setAudioLevel,
}: {
  audioLevel: number;
  setAudioLevel: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-lg bg-transparent"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="center">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Volume</span>
              <span className="text-sm text-muted-foreground">
                {audioLevel}%
              </span>
            </div>
            <Slider
              value={[audioLevel]}
              onValueChange={(value) => setAudioLevel(value[0])}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-teal-600"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
