import { Calendar } from "lucide-react";
import { RemindersView } from "@/components/RemindersView";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

export function RemindersPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Calendar className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-6 max-h-[35vh] overflow-hidden">
        <RemindersView className="flex flex-row gap-2" />
      </PopoverContent>
    </Popover>
  );
}
