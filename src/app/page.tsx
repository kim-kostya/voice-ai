"use client";

import { HelpCircle, Mic, MicOff, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [volume, setVolume] = useState(75);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate listening for 3 seconds then speaking
      setTimeout(() => {
        setIsListening(false);
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 2000);
      }, 3000);
    }
  };

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
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Status Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-foreground">
              {isListening
                ? "Listening..."
                : isSpeaking
                  ? "Speaking..."
                  : "Ready to chat"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isListening
                ? "I'm listening to your voice"
                : isSpeaking
                  ? "Let me respond to that"
                  : "Click the microphone to start"}
            </p>
          </div>

          {/* Microphone Button */}
          <div className="relative">
            <Button
              onClick={toggleListening}
              size="lg"
              className={`
                w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary
                hover:scale-105 transition-all duration-200 shadow-lg
                ${isListening ? "pulse-listening" : ""}
                ${isSpeaking ? "bg-accent" : ""}
              `}
            >
              {isListening ? (
                <Mic className="w-8 h-8 text-primary-foreground" />
              ) : (
                <MicOff className="w-8 h-8 text-primary-foreground" />
              )}
            </Button>
          </div>

          {/* Audio Waveform Visualization */}
          {isSpeaking && (
            <div className="flex items-center justify-center space-x-1 h-12">
              {[...Array(5)].map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: its hardcoded array
                  key={i}
                  className="w-1 bg-accent wave-bar rounded-full"
                  style={{ height: "20px" }}
                />
              ))}
            </div>
          )}

          {/* Volume Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Volume</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(22, 78, 99) 0%, rgb(22, 78, 99) ${volume}%, rgb(241, 245, 249) ${volume}%, rgb(241, 245, 249) 100%)`,
                }}
              />
              <style jsx>{`
                .slider::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: rgb(22, 78, 99);
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .slider::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: rgb(22, 78, 99);
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
              `}</style>
            </div>
            <div className="text-xs text-muted-foreground">{volume}%</div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span>Connected</span>
          </div>
        </div>
      </main>
    </div>
  );
}
