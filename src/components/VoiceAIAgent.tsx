"use client";

import "@livekit/components-styles";
import { BarVisualizer, useVoiceAssistant } from "@livekit/components-react";

export default function VoiceAIAgent() {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();

  return (
    <div className="h-80">
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        style={{}}
      />
      <p className="text-center">{state}</p>
      {agentTranscriptions.map((item) => (
        <p key={item.id}>{item.text}</p>
      ))}
    </div>
  );
}
