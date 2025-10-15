import { Cloud } from "lucide-react";

export default function WeatherCard() {
  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm">
      <h3 className="font-medium mb-2">Weather</h3>
      <p className="text-sm text-gray-500">Your City</p>
      <div className="flex items-center gap-3 mt-2">
        <Cloud className="w-8 h-8 text-gray-400" />
        <div>
          <p className="text-xl font-bold">22°C</p>
          <p className="text-sm text-gray-500">Partly Cloudy</p>
        </div>
      </div>
      <p className="text-xs mt-2 text-gray-500">Humidity: 65% · Wind: 12 km/h</p>
    </div>
  );
}
