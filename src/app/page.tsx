"use client";

import { LiveKitRoom } from "@/components/LiveKitRoom";
import { ChatHistoryPopover } from "@/components/popover/ChatHistoryPopover";
import { VolumeControlPopover } from "@/components/popover/VolumeControlPopover";
import { Header } from "@/components/ui/Header";
import VoiceButton from "@/components/VoiceButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-20">
        <VoiceButton />
        <div className="flex items-center gap-2 mt-4">
          <VolumeControlPopover />
          <ChatHistoryPopover />
        </div>
      </main>
    </div>
  );
}
