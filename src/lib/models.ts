export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface AgentRPCMessageBase {
  type: string;
}

export interface AgentRPCSuccess extends AgentRPCMessageBase {
  type: "success";
}

export interface ReminderRPCMessage extends AgentRPCMessageBase {
  type: "reminder";
  time: Date;
  text: string;
}

export interface RemindersWithIdRPCMessage extends AgentRPCMessageBase {
  type: "reminders_with_id";
  reminders: {
    id: string;
    time: Date;
    text: string;
  }[];
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
  | RemindersWithIdRPCMessage
  | GeoLocationRPCMessage
  | AgentRPCSuccess
  | AgentRPCError;
