import json
from dataclasses import dataclass
from datetime import datetime

from livekit.rtc import Room


@dataclass
class Reminder:
  id: str
  text: str
  time: datetime

@dataclass
class GeoLocation:
  latitude: float
  longitude: float


@dataclass
class AgentRPCSuccess:
  type: str = "success"


@dataclass
class ReminderRPCMessage:
  time: datetime
  text: str


@dataclass
class RemindersWithIdRPCMessage:
  reminders: list[dict]


@dataclass
class GeoLocationRPCMessage:
  location: GeoLocation


@dataclass
class AgentRPCError:
  message: str


class RPCError(Exception):
  pass


class AgentRPCClient:
  room: Room
  participant: str

  def __init__(self, room: Room, participant: str):
    self.room = room
    self.participant = participant

  async def __perform_rpc_call(self, method: str, payload: dict[str, any]) -> dict[str, any]:
    response = json.loads(await self.room.local_participant.perform_rpc(
      destination_identity=self.participant,
      method=method,
      payload=json.dumps(payload),
    ))

    if 'json' not in response:
      raise RPCError("Invalid RPC response")

    payload = response['json']

    if 'type' not in payload:
      raise RPCError("Invalid RPC response")

    if payload['type'] == 'error':
      if 'message' not in payload:
        raise RPCError("Invalid RPC response")

      raise RPCError(payload['message'])

    return payload

  async def get_location(self) -> GeoLocationRPCMessage:
    response = await self.__perform_rpc_call("get_location", {})

    if 'type' not in response or response['type'] != 'geo_location':
      raise RPCError("Invalid RPC response")

    if 'location' not in response:
      raise RPCError("Invalid RPC response")

    if 'latitude' not in response['location'] or 'longitude' not in response['location']:
      raise RPCError("Invalid RPC response")

    return GeoLocationRPCMessage(
      location=GeoLocation(
        latitude=response['location']['latitude'],
        longitude=response['location']['longitude'],
      )
    )

  async def get_reminders(self) -> RemindersWithIdRPCMessage:
    response = await self.__perform_rpc_call("get_reminders", {})

    if 'type' not in response or response['type'] != 'reminders_with_id':
      raise RPCError("Invalid RPC response")

    if 'reminders' not in response:
      raise RPCError("Invalid RPC response")

    return RemindersWithIdRPCMessage(reminders=response['reminders'])

  async def add_reminder(self, reminder: Reminder):
    response = await self.__perform_rpc_call("add_reminder", {
      "id": reminder.id,
      "text": reminder.text,
      "time": reminder.time.isoformat()
    })

    if 'type' not in response or response['type'] != 'success':
      raise RPCError("Invalid RPC response")

  async def remove_reminder(self, reminder_id: str):
    response = await self.__perform_rpc_call("remove_reminder", {
      "id": reminder_id
    })

    if 'type' not in response or response['type'] != 'success':
      raise RPCError("Invalid RPC response")