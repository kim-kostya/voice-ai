from dataclasses import dataclass


@dataclass()
class ResponaUserData:
  user_id: str
  timezone_offset: int
  voice_id: str