import datetime
import json
import logging
import textwrap
from typing import AsyncIterable, Coroutine, Any

from dotenv import load_dotenv
from livekit.agents import (
  Agent,
  AgentSession,
  AutoSubscribe,
  JobContext,
  RoomOutputOptions,
  WorkerOptions,
  cli, function_tool, RunContext, get_job_context, RoomInputOptions, JobProcess, llm, FunctionTool, ModelSettings,
)
from livekit.agents.llm import RawFunctionTool
from livekit.plugins import assemblyai
from livekit.plugins import elevenlabs
from livekit.plugins import openai
from livekit.plugins import silero
from livekit.rtc import RpcInvocationData

from memory import init_memory
from rpc import AgentRPCClient, parse_rpc_message, serialize_rpc_message
from userdata import ResponaUserData, Reminder
from weather import get_coords_by_location, get_current_weather_by_coords

load_dotenv()

logger = logging.getLogger("agent")


class ResponaAgent(Agent):
  initial_reminder: Reminder | None = None

  def __init__(self, voice_id: str, initial_reminder: Reminder | None = None):
    super().__init__(
      instructions="""
      You are in-development helpful AI agent called Respona. Talk in a light but formal manner and try to be more friendly.
      
      No need to specify timezone offset when adding reminder to calendar, because it's already taken care of by the tool.
      """,
      stt=assemblyai.STT(),
      llm=openai.llm.LLM(
        base_url="https://openrouter.ai/api/v1",
        model="openai/gpt-4.1-nano"
      ),
      tts=elevenlabs.TTS(
        voice_id=voice_id,
        model="eleven_multilingual_v2"
      )
    )

  async def llm_node(self, chat_ctx: llm.ChatContext, tools: list[FunctionTool | RawFunctionTool],
                     model_settings: ModelSettings) -> (
    AsyncIterable[llm.ChatChunk | str]
    | Coroutine[Any, Any, AsyncIterable[llm.ChatChunk | str]]
    | Coroutine[Any, Any, str]
    | Coroutine[Any, Any, llm.ChatChunk]
    | Coroutine[Any, Any, None]
  ):
    chat_ctx.add_message(role="assistant", content=f"""
    Current time in user's local timezone (YYYY-MM-DD hh:mm:ss): {datetime.datetime.now(self.session.userdata.timezone).strftime("%Y-%m-%D %H:%M:%S")}
    Current day of week: {datetime.datetime.now(self.session.userdata.timezone).strftime("%A")}
    """)
    await self.update_chat_ctx(chat_ctx)

    return super().llm_node(chat_ctx, tools, model_settings)

  async def on_user_turn_completed(self, turn_ctx: llm.ChatContext, new_message: llm.ChatMessage) -> None:

    # await save_memory(self.session.userdata.user_id, new_message.text_content)
    #
    # search_results = await search_memory(self.session.userdata.user_id, new_message.text_content)
    # additional_context = "<memory>"
    # if search_results:
    #   additional_context += "\n\n".join(search_results)
    # additional_context += "\n</memory>"
    #
    # turn_ctx.add_message(role="assistant", content=additional_context)
    # try:
    #   await self.update_chat_ctx(turn_ctx)
    # except Exception as e:
    #   logger.warning(f"Unable to update chat context: {e}")

    return await super().on_user_turn_completed(turn_ctx, new_message)

  @function_tool(
    description="Get user location based on ip address or geolocation (DON'T TELL USER ABOUT THIS OR USE IT WHEN USER ASK ABOUT LOCATION, ONLY USE IT FOR OTHER TOOL CALLS.)")
  async def get_location(
    self,
    context: RunContext
  ):
    print("get_location called")
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

  @function_tool(description="""
  Get location coordinates based on location name
  
  @param location: Location name or address
  """)
  async def get_coords_by_location(
    self,
    context: RunContext,
    location: str
  ):
    print("get_coords_by_location called")
    try:
      context.disallow_interruptions()
      coords = get_coords_by_location(location)

      if "latitude" not in coords or "longitude" not in coords:
        return json.dumps({"error": "location_unavailable"})

      return json.dumps({
        "latitude": coords[0],
        "longitude": coords[1]
      })
    except Exception as e:
      print(e)
      return json.dumps({"error": "location_unavailable"})

  @function_tool(description="Get current weather based on latitude and longitude")
  async def get_weather(
    self,
    context: RunContext,
    latitude: float,
    longitude: float
  ):
    print("get_weather called")
    try:
      weather = get_current_weather_by_coords(latitude, longitude)
      return json.dumps(weather)
    except Exception as e:
      print(e)
      return "Unable to get weather"

  @function_tool(description="Get list of reminders or calendar events")
  async def get_reminders(self, context: RunContext):
    print("get_reminders called")
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
  This method already takes care of timezone offset, so you don't need to worry about it.
  
  @param reminder_text: Reminder text
  @param reminder_time: Reminder time in format (YYYY-MM-DD hh:mm:ss) in user's local timezone
  """)
  async def add_reminder(self, context: RunContext, reminder_text: str, reminder_time: str):
    try:
      context.disallow_interruptions()
      room = get_job_context().room
      participant_identity = next(iter(room.remote_participants))
      rpc_client = AgentRPCClient(room, participant_identity)

      print(f"Adding reminder for {reminder_time}")

      timezone: datetime.timezone = self.session.userdata.timezone
      reminder_datetime = datetime.datetime.strptime(reminder_time, "%Y-%m-%d %H:%M:%S")
      reminder_datetime = reminder_datetime.replace(tzinfo=timezone)

      print(f"Converted reminder time to {reminder_datetime.isoformat()}")

      await rpc_client.add_reminder({
        "text": reminder_text,
        "time": reminder_datetime.astimezone(datetime.timezone.utc).isoformat()
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
    print("remove_reminder called")
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

  @function_tool(description="""
  Find the closest date for a specific day of the week from today

  @param day_of_week: Day of the week (e.g., "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
  """)
  async def get_closest_date_from_day_of_week(self, context: RunContext, day_of_week: str):
    print(f"get_closest_date_from_day_of_week called with {day_of_week}")
    try:
      context.disallow_interruptions()

      days = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6
      }

      day_of_week_lower = day_of_week.lower()
      if day_of_week_lower not in days:
        return json.dumps({
                            "error": "Invalid day of week. Please use Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, or Sunday"})

      target_day = days[day_of_week_lower]
      now = datetime.datetime.now(self.session.userdata.timezone)
      current_day = now.weekday()

      days_ahead = target_day - current_day
      if days_ahead <= 0:
        days_ahead += 7

      next_date = now + datetime.timedelta(days=days_ahead)

      return json.dumps({
        "day_of_week": day_of_week,
        "date": next_date.strftime("%Y-%m-%d")
      })
    except Exception as e:
      print(e)
      return json.dumps({"error": "Unable to calculate closest date"})

  async def on_enter(self) -> None:
    if self.initial_reminder is not None:
      await self.session.generate_reply(
        instructions="User's reminder time was reached. Notify user about reminder.",
        user_input=f"""
        <reminder>
          <time>{self.initial_reminder.time}</time>
          <text>
          {textwrap.indent(self.initial_reminder.text, "  ", lambda line: line != 0)}
          </text>
        </reminder>
        """)
    else:
      await self.session.say("Hello, I am Respona. How can I help you today?")


def prewarm(proc: JobProcess):
  proc.userdata["vad_model"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
  init_memory()
  await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

  remote_participant = await ctx.wait_for_participant()

  session = AgentSession[ResponaUserData](
    userdata=ResponaUserData(
      user_id=remote_participant.identity,
      timezone=datetime.timezone(
        offset=datetime.timedelta(minutes=int(remote_participant.attributes["timezone_offset"]))),
      voice_id=remote_participant.attributes["voice_id"]
    ),
    vad=ctx.proc.userdata["vad_model"],
    use_tts_aligned_transcript=True,
    preemptive_generation=False,
    min_interruption_words=1,
    min_endpointing_delay=0.8,
  )

  @ctx.room.local_participant.register_rpc_method("set_audio_output")
  async def set_audio_output(data: RpcInvocationData) -> str:
    await session.interrupt(force=True)
    req = json.loads(data.payload)
    session.input.set_audio_enabled(req["enabled"])
    session.output.set_audio_enabled(req["enabled"])
    print("Set audio output to " + ("enabled" if req["enabled"] else "disabled"))
    return serialize_rpc_message({"type": "success"})

  @ctx.room.local_participant.register_rpc_method("set_voice")
  async def set_voice(data: RpcInvocationData) -> str:
    req = parse_rpc_message(data.payload)
    session.userdata.voice_id = req["voiceId"]
    session.update_agent(ResponaAgent(voice_id=session.userdata.voice_id))
    return serialize_rpc_message({"type": "success"})

  @ctx.room.local_participant.register_rpc_method("notify_about_reminder")
  async def notify_about_reminder(data: RpcInvocationData) -> str:
    print("Received reminder notification")
    req = parse_rpc_message(data.payload)

    await session.interrupt(force=True)
    await session.generate_reply(
      instructions="User's reminder time was reached. Notify user about reminder.",
      user_input=f"""
      <reminder>
        <time>{req["reminder"]["time"]}</time>
        <text>
        {textwrap.indent(req["reminder"]["text"], "  ", lambda line: line != 0)}
        </text>
      </reminder>
      """
    )

    return serialize_rpc_message({"type": "success"})

  initial_reminder_raw = json.dumps(remote_participant.attributes["initial_reminder"]) \
    if "initial_reminder" in remote_participant.attributes \
    else None

  initial_reminder = None
  if initial_reminder_raw is not None and "text" in initial_reminder_raw and "time" in initial_reminder_raw:
    initial_reminder = Reminder(
      text=initial_reminder_raw["text"],
      time=initial_reminder_raw["time"]
    )

  await session.start(
    agent=ResponaAgent(
      voice_id=remote_participant.attributes["voice_id"],
      initial_reminder=initial_reminder
    ),
    room=ctx.room,
    room_input_options=RoomInputOptions(
      close_on_disconnect=True,
      text_enabled=True,
      audio_enabled=True,
    ),
    room_output_options=RoomOutputOptions(
      transcription_enabled=True,
      audio_enabled=True,
      sync_transcription=True,
    ),
  )


if __name__ == "__main__":
  cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
