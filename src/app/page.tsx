"use client";

import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { VoiceAIAgentContainer } from "@/components/VoiceAIAgentContainer";

export default function Home() {
  const [isAgentStarted, setIsAgentStarted] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-20">
        <div className="flex flex-col items-center gap-6 mb-8">
          <VoiceAIAgentContainer />
        </div>
      </main>
    </div>
  );
}
