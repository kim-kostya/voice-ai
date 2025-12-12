"use client";

import { ChatHistoryPopover } from "@/components/popover/ChatHistoryPopover";
import { DebugPopover } from "@/components/popover/DebugPopover";
import { RemindersPopover } from "@/components/popover/RemindersPopover";
import { VoiceModelSettingsPopover } from "@/components/popover/VoiceModelSettingsPopover";
import { VolumeControlPopover } from "@/components/popover/VolumeControlPopover";
import { ReminderPushNotificationHandler } from "@/components/ReminderPushNotificationHandler";
import VoiceButton from "@/components/VoiceButton";
import { VoiceTranscriptionHandler } from "@/components/VoiceTranscriptionHandler";
import { useAgentAudioOutput } from "@/lib/hooks/agent";

export default function Home() {
  useAgentAudioOutput(true);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-20">
      <VoiceButton />
      <div className="flex items-center gap-2 mt-4">
        <VoiceModelSettingsPopover />
        <VolumeControlPopover />
        <ChatHistoryPopover />
        <RemindersPopover />
        {process.env.NODE_ENV === "development" && <DebugPopover />}
        <VoiceTranscriptionHandler />
        <ReminderPushNotificationHandler />
      </div>
    </main>
  );
}
