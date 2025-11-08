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
  retryCount: number;
  volume: number;
  setRoom: (room: Room) => void;
  setRoomState: (state: RoomState) => void;
  setAgentState: (state: AgentState) => void;
  setRetryCount: (count: number) => void;
  setVolume: (volume: number) => void;
};

export const useLiveKit = create<LiveKitState>((set) => ({
  room: undefined,
  roomState: "disconnected",
  agentState: "disconnected",
  retryCount: 0,
  volume: 50,
  setRoom: (room) => set({ room }),
  setRoomState: (state) => set({ roomState: state }),
  setAgentState: (state) => set({ agentState: state }),
  setRetryCount: (count) => set({ retryCount: count }),
  setVolume: (volume) => set({ volume }),
}));
