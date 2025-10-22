import os

from dotenv import load_dotenv
from pyowm import OWM

load_dotenv()

def get_current_weather_by_coords(lat: float, lon: float) -> dict:
  api_key = os.getenv("OPENWEATHER_API_KEY")
  owm = OWM(api_key=api_key)
  weather_manager = owm.weather_manager()

  observation = weather_manager.weather_at_coords(lat, lon)
  weather = observation.weather
  return {
    "temperature": weather.temperature("celsius")["temp"],
    "status": weather.detailed_status,
    "icon": weather.weather_icon_name
  }