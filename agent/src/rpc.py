import json
from typing import TypeVar, get_args
from dataclasses import dataclass
from datetime import datetime

from livekit.rtc import Room

TResponse = TypeVar("TResponse")


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

    if 'type' not in response:
      raise RPCError("Invalid RPC response")

    if response['type'] == 'error':
      if 'message' not in response:
        raise RPCError("Invalid RPC response")

      raise RPCError(response['message'])

    return response

  async def get_location(self) -> GeoLocationRPCMessage:
    response = await self.__perform_rpc_call("get_location", {})

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
