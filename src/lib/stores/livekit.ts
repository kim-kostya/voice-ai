import type { Room } from "livekit-client";
import { create } from "zustand";

export type RoomState = "connecting" | "connected" | "disconnected" | "failed";
export type AgentState =
  | "speaking"
  | "thinking"
  | "listening"
  | "connecting"
  | "disconnected"
  | "failed";

export interface ChatMessage {
  id: string;
  message: string;
  timestamp: number;
  from: "user" | "agent";
}

export type LiveKitState = {
  room: Room | undefined;
  roomState: RoomState;
  agentState: AgentState;
  volume: number;
  voiceId: string | undefined;
  isAudioEnabled: boolean;
  chatMessages: ChatMessage[];
  setRoom: (room: Room) => void;
  setRoomState: (state: RoomState) => void;
  setAgentState: (state: AgentState) => void;
  setVoiceId: (voiceId: string) => void;
  setVolume: (volume: number) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
};

export const useLiveKit = create<LiveKitState>((set) => ({
  room: undefined,
  roomState: "disconnected",
  agentState: "disconnected",
  voiceId: undefined,
  volume: 50,
  isAudioEnabled: false,
  chatMessages: [],
  setRoom: (room) => set({ room }),
  setRoomState: (state) => set({ roomState: state }),
  setAgentState: (state) => set({ agentState: state }),
  setVoiceId: (voiceId) => set({ voiceId }),
  setVolume: (volume) => set({ volume }),
  setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
}));
