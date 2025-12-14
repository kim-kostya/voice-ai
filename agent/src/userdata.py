import datetime
from dataclasses import dataclass

@dataclass()
class Reminder:
  text: str
  time: str


@dataclass()
class ResponaUserData:
  user_id: str
  timezone: datetime.timezone
  voice_id: str