import { Type } from "lucide-react";
import ChatHistory from "@/components/ChatHistory";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

export function ChatHistoryPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Type className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-6 max-h-[50vh] overflow-hidden">
        <ChatHistory inverse={true} maxMessageCount={10} />
      </PopoverContent>
    </Popover>
  );
}
