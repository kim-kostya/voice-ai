import os

from dotenv import load_dotenv
from pyowm import OWM

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
owm = OWM(api_key=API_KEY)
weather_manager = owm.weather_manager()

def get_current_weather_by_coords(lat: float, lon: float) -> dict:
  observation = weather_manager.weather_at_coords(lat, lon)
  weather = observation.weather
  return {
    "temperature": weather.temperature("celsius")["temp"],
    "status": weather.detailed_status,
    "icon": weather.weather_icon_name
  }