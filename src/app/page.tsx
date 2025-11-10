"use client";

import { CalendarPopover } from "@/components/popover/CalendarPopover";
import { ChatHistoryPopover } from "@/components/popover/ChatHistoryPopover";
import { VolumeControlPopover } from "@/components/popover/VolumeControlPopover";
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
        <VoiceTranscriptionHandler />
        <CalendarPopover />
      </div>
    </main>
  );
}
