import datetime
from dataclasses import dataclass


@dataclass()
class ResponaUserData:
  user_id: str
  timezone_offset: datetime.timezone
  voice_id: str