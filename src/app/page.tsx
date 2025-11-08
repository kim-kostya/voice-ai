"use client";

import { LiveKitRoom } from "@/components/LiveKitRoom";
import { Header } from "@/components/ui/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-20">
        <div className="flex flex-col items-center gap-6 mb-8">
          <LiveKitRoom>
            <div className="w-full max-w-md"></div>
          </LiveKitRoom>
        </div>
      </main>
    </div>
  );
}
