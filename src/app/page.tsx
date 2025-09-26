"use client";

import { HelpCircle, Mic } from "lucide-react";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VoiceAIAgentContainer } from "@/components/VoiceAIAgentContainer";

export default function Home() {
  const [showHelp, setShowHelp] = useState(false);
  const [isAgentStarted, setAgentStarted] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card px-6 py-4 border-b border-border">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-card-foreground font-serif">
            Voice AI
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Help Overlay */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4 p-6 bg-popover text-popover-foreground">
            <h3 className="text-lg font-semibold mb-4">How to use</h3>
            <ul className="space-y-2 text-sm">
              <li>• Click the microphone to start listening</li>
              <li>• Speak clearly when the button is pulsing</li>
              <li>• The AI will respond after processing</li>
              <li>• Adjust volume using the slider below</li>
            </ul>
            <Button onClick={() => setShowHelp(false)} className="mt-4 w-full">
              Got it
            </Button>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {isAgentStarted ? (
          <Suspense fallback={<div>Loading...</div>}>
            <VoiceAIAgentContainer />
          </Suspense>
        ) : (
          <button
            onClick={() => setAgentStarted(true)}
            className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            type="button"
          >
            <Mic className="h-8 w-8" />
          </button>
        )}
      </main>
    </div>
  );
}
