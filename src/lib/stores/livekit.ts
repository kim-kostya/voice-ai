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

export type LiveKitState = {
  room: Room | undefined;
  roomState: RoomState;
  agentState: AgentState;
  volume: number;
  isAudioEnabled: boolean;
  setRoom: (room: Room) => void;
  setRoomState: (state: RoomState) => void;
  setAgentState: (state: AgentState) => void;
  setVolume: (volume: number) => void;
  setAudioEnabled: (enabled: boolean) => void;
};

export const useLiveKit = create<LiveKitState>((set) => ({
  room: undefined,
  roomState: "disconnected",
  agentState: "disconnected",
  volume: 50,
  isAudioEnabled: false,
  setRoom: (room) => set({ room }),
  setRoomState: (state) => set({ roomState: state }),
  setAgentState: (state) => set({ agentState: state }),
  setVolume: (volume) => set({ volume }),
  setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
}));
