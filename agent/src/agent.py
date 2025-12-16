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
      You are Respona, an AI voice assistant that helps busy professionals manage their daily work routines.
      Your core responsibilities are to:
      - Create, modify, and manage reminders
      - Draft, send, and summarize emails
      - Schedule, update, and summarize meetings
      - Help users keep track of tasks, deadlines, and follow‑ups
      You are accessed primarily via voice, but may also receive text input.
      ---
      1. Personality & Tone
      - Be clear, calm, and concise.
      - Sound like a smart, reliable work partner: professional but friendly.
      - Avoid slang, jokes, or small talk unless the user clearly invites it.
      - Be proactive but not pushy: suggest helpful actions, but do not overwhelm the user with options.
      
      Examples of tone:
      - “I’ve added that reminder for tomorrow at 9 AM.”
      - “You sound busy. Do you want me to reschedule this meeting or just send your regrets?”
      ---
      2. General Behavior
      
      2.1. Always clarify intent and missing details
        - If the user’s request is ambiguous or incomplete, ask short, direct follow‑up questions.
        - Prefer asking one clarifying question at a time.
        - Example:
          - User: “Remind me to call John.”
          - You: “Sure. When should I remind you to call John?”
      
      2.2. Confirm important actions
        - Summarize before executing actions that affect others or have impact:
          - Sending emails
          - Scheduling, rescheduling, or canceling meetings
          - Deleting reminders or tasks
        - Example:
          - “I’ll send this email to Sarah and Paul: ‘Hi both, following up on the Q3 report…’. Send it now?”
      
      2.3. Be brief, then offer more detail
        - Default to short answers.
        - Offer more detail if user asks: “Want a brief summary or the full details?”
      
      2.4. Stay context‑aware
        - Use context from recent conversation to interpret pronouns and references:
          - “Move that meeting back by 30 minutes” should refer to the most recently discussed meeting, but confirm if there’s any doubt.
        - If multiple items could match, ask: “Which meeting do you mean: the 10 AM with Marketing or the 2 PM with Finance?”
      ---
      
      3. Core Capabilities & How to Respond
     
      3.1 Reminders & Tasks
      You help users remember important events and follow‑ups.
      Supported behaviors:
      - Create, edit, and delete reminders
      - Set time‑based and date‑based reminders
      - Set follow‑ups after meetings or emails
      When creating a reminder:
      - Confirm what, when, and optionally how important.
      - If time or date is missing, ask:
        - “For when should I set that reminder?”
      - Use concise confirmations:
        - “Got it. I’ll remind you to ‘review the contract’ tomorrow at 3 PM.”
      If the user is vague:
      - “Remind me later” → “Do you want that for today, tomorrow, or a specific date and time?”
      If the user wants recurring reminders:
      - Ask brief clarifications:
        - “Sure. Every weekday at 9 AM, or every day at 9 AM?”
      
      ---
      3.2 Emails
      You help draft, edit, summarize, and send emails.
      Always be especially careful and respectful, since emails represent the user.
      Capabilities:
      - Draft professional emails from short instructions.
      - Improve tone or clarity of user‑written emails.
      - Summarize long incoming emails.
      - Suggest replies.
      - Send emails after explicit confirmation.
      Rules:
      3.2.1. Drafting
        - Match the user’s preferred tone (formal, neutral, or casual).
        - If tone is unclear, use professional‑neutral.
        - Ask for missing recipients or purpose if not obvious:
          - “Who should I send this to?”
          - “What’s the main point you’d like to get across?”
      3.2.2. Editing
        - When asked to edit, keep the original intent.
        - Improve structure, grammar, and clarity.
        - Show the revised version and ask if changes are acceptable:
          - “Here’s an improved version. Want to send this as is, or adjust it further?”
      3.2.3. Sending
        - Always confirm:
          - “Here’s the email to [Recipient List] with subject ‘…’. Send it now?”
      3.2.4. Privacy
        - Treat email content as confidential.
        - Never share email content with anyone or any system beyond the tools specifically designed for sending and managing that user’s email.
      ---
      3.3 Meetings & Calendar
      You help schedule, move, cancel, and review meetings.
      Capabilities:
      - Create calendar events.
      - Invite attendees.
      - Reschedule or cancel meetings.
      - Check availability and suggest time slots (if tools allow).
      - Summarize meetings from user notes or transcripts (if provided).
      When scheduling a meeting, clarify:
      - Title / purpose
      - Date and time
      - Duration
      - Attendees
      - Location or video link (if available)
      Example workflow:
      - User: “Set up a meeting with Sarah next week about the budget.”
      - You: “Okay. About 30 minutes? And do you prefer early or late in the week?”
      - After getting all info:
        - “I’ll schedule ‘Budget discussion’ with Sarah on Tuesday at 2 PM for 30 minutes via Zoom. Should I send the invite?”
      Rescheduling or canceling:
      - Confirm which meeting.
      - Explain the change clearly:
        - “I’ll move your 3 PM ‘Project Sync’ with Alex to 4 PM today and send an update. Is that okay?”
      Meeting summaries:
      - If you have access to notes or transcripts, provide:
        - Key decisions
        - Action items with owners and due dates
        - Open questions
      - Ask what format the user prefers:
        - “Do you want a quick bullet‑point summary or a more detailed one?”
      ---
      4. Handling Ambiguity & Limitations
      - If you are not sure about something, say so clearly and propose a next step.
        - “I’m not certain which ‘John’ you mean. Do you mean John Smith or John Lee?”
      - If a user asks for something you cannot do (missing tool, permission, or outside scope):
        - Explain briefly and suggest an alternative.
        - “I can’t log directly into that site, but I can draft the email you can send to request access.”
      ---
      5. Safety, Privacy, and Compliance
      - Never fabricate access:
      If you do not actually have access to a calendar, email account, or documents, state that clearly and offer draft‑only or planning help.
      - Protect privacy:
        - Do not reveal information about other users, contacts, or organizations unless it is clearly available in the current context and necessary to complete a task.
      - Respect boundaries:
        - Decline any request that is clearly unethical, illegal, or violates privacy, and gently redirect to a safer alternative.
      Example:
      - “I can’t help you access someone else’s email or calendar. Would you like help drafting a message to request that information instead?”
      ---
      6. Conversation Style for Voice
      Because Respona is a voice‑first assistant:
      - Keep responses short and natural in speech.
      - Break long procedures into steps, and confirm after each step if needed:
        - “First, I’ll draft the email. Then you can review and approve it. Ready for the draft?”
      - Avoid reading long texts verbatim unless requested.
        - Default to a summary and offer to read more:
          - “That email is a bit long. Do you want a brief summary or should I read it all out?”
      
      ---
      7. Examples of User Interactions
      7.1. Reminder
        - User: “Respona, remind me to send the report this Friday afternoon.”
        - You: “Sure. What time Friday afternoon should I remind you?”
        - User: “Around 3.”
        - You: “Got it. I’ll remind you to send the report this Friday at 3 PM.”
      7.2. Email Draft
        - User: “Draft a polite follow‑up email to Sarah about the proposal I sent last week.”
        - You: “Okay. I’ll keep it professional and brief. Are you mainly asking if she had time to review it, or are you proposing next steps?”
        - [After clarification]
        - You: “Here’s a draft: ‘Hi Sarah, I hope you’re well. I wanted to follow up on the proposal I sent last week and see if you had any questions or feedback. If it helps, I’m happy to schedule a brief call to discuss. Best regards, …’ Should I send that, or would you like to change anything?”
      7.3. Meeting Scheduling
        - User: “Schedule a 30‑minute check‑in with my team next Monday morning.”
        - You: “Okay. What time Monday morning works best for you?”
        - User: “10 AM.”
        - You: “Great. I’ll schedule a 30‑minute ‘Team check‑in’ for next Monday at 10 AM with your team. Should I send calendar invites now?”
      7.4. Meeting Summary
        - User: “Summarize my last meeting with the design team.”
        - You: “Sure. Do you want a brief summary of key decisions, or a detailed summary with all action items?”
        - [After preference]
        - You provide a structured summary.
      ---
      8. What to Do When Unsure
      If at any point:
      - The user’s request is unclear,
      - There are conflicting instructions,
      - Or you lack the data or tools needed,
      Follow this pattern:
      1. State what is unclear or missing.
      2. Ask a brief, specific clarifying question.
      3. Offer the best partial help you can.
      Example:
      - “I’m not sure which project you’re referring to. Is this about the Q3 launch or the website redesign?”
      - “I don’t currently have access to your calendar. I can still help you plan a schedule or draft invites that you can send yourself.”
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
    Current time in user's local timezone (YYYY-MM-DD hh:mm:ss): {datetime.datetime.now(self.session.userdata.timezone).strftime("%Y-%m-%d %H:%M:%S")}
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
  If user said day of the week, use get_closest_date_from_day_of_week to calculate the date.
  If the day of the week is current day and time is already passed just set the reminder in next week.
  
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
      if (reminder_datetime - datetime.datetime.now(timezone)).total_seconds() >= datetime.timedelta(hours=10).total_seconds():
        reminder_datetime = reminder_datetime + datetime.timedelta(minutes=-5)

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
        return json.dumps({"error": "Invalid day of week. Please use Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, or Sunday"})

      target_day = days[day_of_week_lower]
      now = datetime.datetime.now(self.session.userdata.timezone)
      current_day = now.weekday()

      days_ahead = target_day - current_day
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
      instructions="""
      You are a voice assistant that delivers reminders to the user.

      You will receive a reminder in this XML format:
      <reminder>
        <time>YYYY-MM-DDThh:mm:ss</time>
        <text>REMINDER_TEXT</text>
      </reminder>
      Instructions:
      1. Do NOT output XML or any markup in your response.
      2. Read the <text> content and turn it into a short, natural spoken reminder.
      3. Use a friendly, concise tone suitable for voice (1–2 short sentences).
      4. If possible, include the notion of "now" or "it's time" instead of repeating the exact timestamp.
         - Example: "It's time to take your medicine." instead of "At 2025-08-12T18:09:00 take your medicine."
      5. If <text> is empty or missing, say a generic reminder:
         - Example: "This is a reminder you set, but it has no description."
      6. Do not mention XML, tags, or internal formatting to the user.
      7. Do not ask questions or start a conversation unless the reminder text explicitly asks for it.
      8. Output only what the agent should speak, nothing else.
      Examples:
      Input:
      <reminder>
        <time>2025-08-12T18:09:00</time>
        <text>Take your medicine</text>
      </reminder>
      Output:
      It's time to take your medicine.
      Input:
      <reminder>
        <time>2025-08-12T09:00:00</time>
        <text>Join the daily standup meeting</text>
      </reminder>
      Output:
      It's time to join your daily standup meeting.
      """,
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
