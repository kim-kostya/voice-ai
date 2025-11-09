import { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type ChatMessage, useLiveKit } from "@/lib/stores/livekit";

export default function ChatHistory() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { chatMessages } = useLiveKit();

  return (
    <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
      <div className="max-w-3xl mx-auto space-y-6">
        {chatMessages.map((message: ChatMessage) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.from === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.from === "agent" && (
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 border-2 border-white rounded-sm" />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[70%] ${
                message.from === "user"
                  ? "bg-teal-600 text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.message}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {message.from === "user" && (
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold">U</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
