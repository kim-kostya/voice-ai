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

from rpc import AgentRPCClient
from weather import get_current_weather_by_coords

load_dotenv()

logger = logging.getLogger("transcriber")


class DevAgent(Agent):
  def __init__(self):
    super().__init__(
      instructions="You are in-development helpful AI agent called Respona. Talk in a light but formal manner.",
      stt=assemblyai.STT(),
      llm=openai.llm.LLM(
        base_url="https://openrouter.ai/api/v1",
        model="openai/gpt-4.1-nano"
      ),
      tts=elevenlabs.TTS(
        voice_id="WAhoMTNdLdMoq1j3wf3I",
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


def prewarm(proc: JobProcess):
  proc.userdata["vad"] = silero.VAD.load()

def greeting(session: AgentSession):
  session.say("Hello, I am Respona. How can I help you today?", allow_interruptions=False)

async def entrypoint(ctx: JobContext):
  logger.info(f"starting dev agent (speech to text) example, room: {ctx.room.name}")
  await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

  session = AgentSession(
    vad=ctx.proc.userdata["vad"],
    use_tts_aligned_transcript=True,
    preemptive_generation=True,
  )

  ctx.room.on('connected', lambda: greeting(session))

  @ctx.room.local_participant.register_rpc_method("set_audio_output")
  async def set_audio_output(data: RpcInvocationData) -> None:
    req = json.loads(data.payload)
    session.input.set_audio_enabled(req["enabled"])
    session.output.set_audio_enabled(req["enabled"])

  @ctx.room.local_participant.register_rpc_method("set_voice")
  async def set_voice(data: RpcInvocationData) -> None:
    req = json.loads(data.payload)
    new_tts = elevenlabs.TTS(voice_id=req["voice_id"], model="eleven_multilingual_v2")
    session._tts = new_tts

  await session.start(
    agent=DevAgent(),
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
