import { Type } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatHistory from "@/components/ChatHistory";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

export function ChatHistoryPopover() {
  const router = useRouter();

  const navigateToChat = () => router.push("/chat");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Type className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-6 max-h-[54vh] overflow-hidden">
        <div className="flex flex-col gap-4">
          <ChatHistory inverse={true} maxMessageCount={10} />
          <Button
            variant="outline"
            size="icon"
            className="mt-4 w-full justify-center"
            onMouseDown={navigateToChat}
          >
            Full Chat
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
