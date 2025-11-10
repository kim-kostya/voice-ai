"use client";

import { DataTopic } from "@livekit/components-core";
import { useChat } from "@livekit/components-react";
import { Paperclip, Send } from "lucide-react";
import type React from "react";
import { useState } from "react";
import ChatHistory from "@/components/ChatHistory";
import TextChatHandler from "@/components/TextChatHandler";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";

export default function Chat() {
  return (
    <>
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <ChatHistory inverse={false} maxMessageCount={0} />
          <ChatInput />
        </div>
      </main>
      <TextChatHandler />
    </>
  );
}

function ChatInput() {
  const [inputValue, setInputValue] = useState("");
  const { send } = useChat({ channelTopic: DataTopic.CHAT });

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      await send(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  return (
    <div className="border-t border-border p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="flex-shrink-0 bg-transparent"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <TextArea
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[52px] max-h-[200px] resize-none pr-12"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-teal-600 hover:bg-teal-700 flex-shrink-0"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
