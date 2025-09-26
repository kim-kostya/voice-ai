import logging

from dotenv import load_dotenv
from livekit.agents import (
  Agent,
  AgentSession,
  AutoSubscribe,
  JobContext,
  RoomOutputOptions,
  WorkerOptions,
  cli,
)

from livekit.plugins import openai

load_dotenv()

logger = logging.getLogger("transcriber")


class DevAgent(Agent):
  def __init__(self):
    super().__init__(
      instructions="You are in-development AI agent called Marin.",
      llm=openai.realtime.RealtimeModel(
        voice="marin",
        base_url="https://openrouter.ai/api/v1"
      ),
    )


async def entrypoint(ctx: JobContext):
  logger.info(f"starting transcriber (speech to text) example, room: {ctx.room.name}")
  await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

  session = AgentSession()

  await session.start(
    agent=DevAgent(),
    room=ctx.room,
    room_output_options=RoomOutputOptions(
      # If you don't want to send the transcription back to the room, set this to False
      transcription_enabled=True,
      audio_enabled=False,
    ),
  )


if __name__ == "__main__":
  cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
