import { DataTopic } from "@livekit/components-core";
import { useChat } from "@livekit/components-react";
import { ParticipantKind } from "livekit-client";
import { useEffect } from "react";
import { useLiveKit } from "@/lib/stores/livekit";

export default function TextChatHandler() {
  const { chatMessages: newChatMessages } = useChat({
    channelTopic: DataTopic.CHAT,
  });
  const { chatMessages: oldChatMessages, setChatMessages } = useLiveKit();

  // biome-ignore lint/correctness/useExhaustiveDependencies: only update on new transcriptions
  useEffect(() => {
    const chatMessages = [...oldChatMessages];
    newChatMessages.forEach((newMessage) => {
      const existingMessage = chatMessages.find(
        (message) => message.id === newMessage.id,
      );

      if (!existingMessage) {
        chatMessages.push({
          id: newMessage.id,
          message: newMessage.message,
          timestamp: newMessage.timestamp,
          from:
            newMessage.from?.kind === ParticipantKind.AGENT ? "agent" : "user",
        });
      } else {
        existingMessage.message = newMessage.message;
        existingMessage.timestamp = newMessage.timestamp;
      }
    });

    setChatMessages(chatMessages.sort((a, b) => a.timestamp - b.timestamp));
  }, [newChatMessages]);

  return <div style={{ display: "none" }}></div>;
}
