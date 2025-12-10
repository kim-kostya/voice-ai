import { useTranscriptions } from "@livekit/components-react";
import { useEffect } from "react";
import { useLiveKit } from "@/lib/stores/livekit";

export const VoiceTranscriptionHandler = () => {
  const transcriptions = useTranscriptions();
  const { chatMessages: oldChatMessages, setChatMessages } = useLiveKit();

  // biome-ignore lint/correctness/useExhaustiveDependencies: only update on new transcriptions
  useEffect(() => {
    const chatMessages = [...oldChatMessages];
    transcriptions.forEach((newMessage) => {
      const existingMessage = chatMessages.find(
        (message) => message.id === newMessage.streamInfo.id,
      );

      if (!existingMessage) {
        chatMessages.push({
          id: newMessage.streamInfo.id,
          message: newMessage.text,
          timestamp: newMessage.streamInfo.timestamp,
          from: newMessage.participantInfo.identity.startsWith("agent-")
            ? "agent"
            : "user",
        });
      } else {
        existingMessage.message = newMessage.text;
        existingMessage.timestamp = newMessage.streamInfo.timestamp;
      }
    });

    setChatMessages(chatMessages.sort((a, b) => a.timestamp - b.timestamp));
  }, [transcriptions]);

  return <div style={{ display: "none" }}></div>;
};
