import os

from opencage.geocoder import OpenCageGeocode
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

def get_coords_by_location(query: str) -> tuple[float, float]:
  api_key = os.getenv("OPENCAGE_API_KEY")
  geocoder = OpenCageGeocode(api_key)
  results = geocoder.geocode(query)

  if len(results) == 0:
    raise Exception("Location not found")

  if "latitude" not in results[0] or "longitude" not in results[0]:
    raise Exception("Location not found")

  return results[0].latitude, results[0].longitude