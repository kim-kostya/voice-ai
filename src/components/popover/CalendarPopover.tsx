import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CalendarComponent } from "@/components/ui/CalendarComponent";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

export function CalendarPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Calendar className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-6 max-h-[35vh] overflow-hidden">
        <CalendarComponent className="flex flex-row gap-2" />
      </PopoverContent>
    </Popover>
  );
}
