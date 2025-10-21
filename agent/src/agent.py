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
  cli, function_tool, RunContext, get_job_context,
)

from livekit.plugins import openai
from livekit.plugins import assemblyai
from livekit.plugins import elevenlabs

from rpc import AgentRPCClient

load_dotenv()

logger = logging.getLogger("transcriber")


class DevAgent(Agent):
  def __init__(self):
    super().__init__(
      instructions="You are in-development AI agent called Marin.",
      stt=assemblyai.STT(),
      llm=openai.llm.LLM(
        base_url="https://openrouter.ai/api/v1",
        model="google/gemini-2.5-flash"
      ),
      tts=elevenlabs.TTS(
        voice_id="ODq5zmih8GrVes37Dizd",
        model="eleven_multilingual_v2"
      )
    )

  @function_tool()
  async def get_location(
    self,
    context: RunContext
  ):
    """
    Get user geolocation or location based on ip address
    """

    try:
      room = get_job_context().room
      participant_identity = next(iter(room.remote_participants))
      rpc_client = AgentRPCClient(room, participant_identity)

      location = await rpc_client.get_location()

      return json.dumps(location.location)
    except Exception:
      return "Unable to get location"


async def entrypoint(ctx: JobContext):
  logger.info(f"starting dev agent (speech to text) example, room: {ctx.room.name}")
  await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

  session = AgentSession()

  await session.start(
    agent=DevAgent(),
    room=ctx.room,
    room_output_options=RoomOutputOptions(
      # If you don't want to send the transcription back to the room, set this to False
      transcription_enabled=True,
      audio_enabled=True,
    ),
  )


if __name__ == "__main__":
  cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
