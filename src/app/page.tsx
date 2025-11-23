"use client";

import { ChatHistoryPopover } from "@/components/popover/ChatHistoryPopover";
import { VoiceModelSettingsPopover } from "@/components/popover/VoiceModelSettingsPopover";
import { VolumeControlPopover } from "@/components/popover/VolumeControlPopover";
import VoiceButton from "@/components/VoiceButton";
import { VoiceTranscriptionHandler } from "@/components/VoiceTranscriptionHandler";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-20">
      <VoiceButton />
      <div className="flex items-center gap-2 mt-4">
        <VolumeControlPopover />
        <ChatHistoryPopover />
        <VoiceModelSettingsPopover />
      </div>
      <VoiceTranscriptionHandler />
    </main>
  );
}
