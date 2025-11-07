"use client";

import "@livekit/components-styles";
import { useRoomContext, useVoiceAssistant } from "@livekit/components-react";
import { useCallback } from "react";
import { z } from "zod";
import { useAgentRpcMethod } from "@/app/hooks/agent";
import { getLocation } from "@/app/utils/location";
import VoiceButton from "@/components/ui/VoiceButton";
import { trpc } from "@/lib/trpc";

export default function VoiceAIAgent() {
  const roomContext = useRoomContext();
  const { state } = useVoiceAssistant();
  const addReminderMutation = trpc.reminders.addReminder.useMutation();
  const trpcUtils = trpc.useUtils();

  useAgentRpcMethod(
    "get_reminders",
    z.object({}),
    useCallback(async () => {
      const reminders = await trpcUtils.reminders.getReminders.fetch();
      return {
        type: "reminders_with_id",
        reminders,
      };
    }, [trpcUtils]),
  );

  useAgentRpcMethod(
    "add_reminder",
    z.object({
      text: z.string(),
      time: z.date(),
    }),
    async (data) => {
      await addReminderMutation.mutateAsync({
        text: data.text,
        time: data.time,
      });
      return {
        type: "success",
      };
    },
  );

  useAgentRpcMethod(
    "get_location",
    z.object({}),
    useCallback(async () => {
      const location = await getLocation();
      return {
        type: "geo_location",
        location,
      };
    }, []),
  );

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
