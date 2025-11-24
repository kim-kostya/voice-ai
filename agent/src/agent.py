import json
import logging

from dotenv import load_dotenv
from livekit.agents import (
  Agent,
  AgentSession,
  AutoSubscribe,
  JobContext,
  RoomOutputOptions,
  WorkerOptions,
  cli, function_tool, RunContext, get_job_context, RoomInputOptions, JobProcess,
)

from livekit.plugins import openai
from livekit.plugins import assemblyai
from livekit.plugins import elevenlabs
from livekit.plugins import silero
from livekit.rtc import RpcInvocationData

from rpc import AgentRPCClient, Reminder
from weather import get_current_weather_by_coords

load_dotenv()

logger = logging.getLogger("transcriber")


class ResponaAgent(Agent):
  def __init__(self):
    super().__init__(
      instructions="You are in-development helpful AI agent called Respona. Talk in a light but formal manner.",
      stt=assemblyai.STT(),
      llm=openai.llm.LLM(
        base_url="https://openrouter.ai/api/v1",
        model="openai/gpt-4.1-nano"
      ),
      tts=elevenlabs.TTS(
        voice_id="ODq5zmih8GrVes37Dizd",
        model="eleven_multilingual_v2"
      )
    )

  @function_tool(description="Get user location based on ip address or geolocation (DON'T TELL USER ABOUT THIS OR USE IT WHEN USER ASK ABOUT LOCATION, ONLY USE IT FOR OTHER TOOL CALLS.)")
  async def get_location(
    self,
    context: RunContext
  ):
    try:
      context.disallow_interruptions()
      room = get_job_context().room
      participant_identity = next(iter(room.remote_participants))
      rpc_client = AgentRPCClient(room, participant_identity)

      location = await rpc_client.get_location()

      return json.dumps({
        "latitude": location.location.latitude,
        "longitude": location.location.longitude
      })
    except Exception as e:
      print(e)
      return "Unable to get location"

  @function_tool(description="Get current weather based on latitude and longitude")
  async def get_weather(
    self,
    context: RunContext,
    latitude: float,
    longitude: float
  ):
    try:
      weather = get_current_weather_by_coords(latitude, longitude)
      return json.dumps(weather)
    except Exception as e:
      print(e)
      return "Unable to get weather"

  @function_tool(description="Get list of reminders or calendar events")
  async def get_reminders(self, context: RunContext):
    try:
      context.disallow_interruptions()
      room = get_job_context().room
      participant_identity = next(iter(room.remote_participants))
      rpc_client = AgentRPCClient(room, participant_identity)

      reminders = await rpc_client.get_reminders()
      return json.dumps(reminders.reminders)
    except Exception as e:
      print(e)
      return "Unable to get reminders"

  @function_tool(description="""
  Add reminder to calendar
  
  @param reminder_text: Reminder text
  @param reminder_time: Reminder time in ISO 8601 format (YYYY-MM-DDThh:mm:ss), UTC time
  """)
  async def add_reminder(self, context: RunContext, reminder_text: str, reminder_time: str):
    try:
      context.disallow_interruptions()
      room = get_job_context().room
      participant_identity = next(iter(room.remote_participants))
      rpc_client = AgentRPCClient(room, participant_identity)

      await rpc_client.add_reminder({
        "text": reminder_text,
        "time": reminder_time
      })
      return "Reminder added successfully"
    except Exception as e:
      print(e)
      return "Unable to add reminder"

  @function_tool(description="""
  Remove reminder from calendar
  
  @param reminder_id: Reminder id to remove (to get reminder id, use get_reminders function)
  """)
  async def remove_reminder(self, context: RunContext, reminder_id: str):
    try:
      context.disallow_interruptions()
      room = get_job_context().room
      participant_identity = next(iter(room.remote_participants))
      rpc_client = AgentRPCClient(room, participant_identity)

      await rpc_client.remove_reminder(reminder_id)
      return "Reminder removed successfully"
    except Exception as e:
      print(e)
      return "Unable to remove reminder"


def prewarm(proc: JobProcess):
  proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
  await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

  session = AgentSession(
    vad=ctx.proc.userdata["vad"],
    use_tts_aligned_transcript=True
  )

  @ctx.room.local_participant.register_rpc_method("set_audio_output")
  async def set_audio_output(data: RpcInvocationData) -> None:
    req = json.loads(data.payload)
    session.input.set_audio_enabled(req["enabled"])
    session.output.set_audio_enabled(req["enabled"])

  await session.start(
    agent=ResponaAgent(),
    room=ctx.room,
    room_input_options=RoomInputOptions(
      close_on_disconnect=True,
      text_enabled=True,
      audio_enabled=True,
    ),
    room_output_options=RoomOutputOptions(
      # If you don't want to send the transcription back to the room, set this to False
      transcription_enabled=True,
      audio_enabled=True,
      sync_transcription=True,
    ),
  )


if __name__ == "__main__":
  cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
