"use client";

import "@livekit/components-styles";
import { useRoomContext, useVoiceAssistant } from "@livekit/components-react";
import { useEffect } from "react";
import SuperJSON from "superjson";
import VoiceButton from "@/components/ui/VoiceButton";
import { trpc } from "@/lib/trpc";

export default function VoiceAIAgent() {
  const roomContext = useRoomContext();
  const { state } = useVoiceAssistant();
  const addReminderMutation = trpc.reminders.addReminder.useMutation();
  const trpcUtils = trpc.useUtils();

  useEffect(() => {
    roomContext.registerRpcMethod("add_reminder", async (data) => {
      try {
        const request = SuperJSON.parse(data.payload) as {
          text: string;
          time: Date;
        };
        await addReminderMutation.mutateAsync(request);
        return "Reminder added successfully";
      } catch (error) {
        console.error("Error adding reminder:", error);
        return "Failed to add reminder";
      }
    });

    roomContext.registerRpcMethod("get_reminders", async () => {
      try {
        return SuperJSON.stringify(
          await trpcUtils.reminders.getReminders.fetch(),
        );
      } catch (error) {
        console.error("Error getting reminders:", error);
        return "Failed to get reminders";
      }
    });
  });

  return (
    <>
      <VoiceButton
        onClick={async () =>
          await roomContext.localParticipant.setMicrophoneEnabled(
            !roomContext.localParticipant.isMicrophoneEnabled,
          )
        }
        isDisabled={
          state === "disconnected" ||
          state === "connecting" ||
          state === "initializing"
        }
        isMuted={!roomContext.localParticipant.isMicrophoneEnabled}
      />
      <p className="text-center">{state}</p>
    </>
  );
}
