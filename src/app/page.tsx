"use client";

import { ChatHistoryPopover } from "@/components/popover/ChatHistoryPopover";
import { VolumeControlPopover } from "@/components/popover/VolumeControlPopover";
import VoiceButton from "@/components/VoiceButton";
import { VoiceTranscriptionHandler } from "@/components/VoiceTranscriptionHandler";
import { CalendarComponent } from "@/components/ui/CalendarComponent";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-20">
      <VoiceButton />
      <div className="flex items-center gap-2 mt-4">
        <VolumeControlPopover />
        <ChatHistoryPopover />
        <VoiceTranscriptionHandler />
      </div>
       {/* Calendar Section */}
      <div className="w-full max-w-md mt-10">
        <CalendarComponent />
      </div>
    </main>
  );
}
