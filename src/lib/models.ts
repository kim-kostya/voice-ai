export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface AgentRPCMessageBase {
  type: string;
}

export interface ReminderRPCMessage extends AgentRPCMessageBase {
  type: "reminder";
  time: Date;
  message: string;
}

export interface ReminderWithIdRPCMessage extends AgentRPCMessageBase {
  type: "reminder_with_id";
  id: number;
  time: Date;
  message: string;
}

export interface GeoLocationRPCMessage {
  type: "geo_location";
  location: GeoLocation;
}

export interface AgentRPCError {
  type: "error";
  message: string;
}

export type AgentRPCMessage =
  | ReminderRPCMessage
  | ReminderWithIdRPCMessage
  | GeoLocationRPCMessage
  | AgentRPCError;
