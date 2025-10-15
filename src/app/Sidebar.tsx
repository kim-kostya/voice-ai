import WeatherCard from "./WeatherCard";
import CalendarCard from "./CalendarCard";
import { Cloud, Bell } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-white border-r border-gray-200 p-4 flex flex-col gap-6">
      {/* Quick Actions (placeholders) */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <button className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg border hover:bg-gray-50 w-full">
          <Cloud className="w-4 h-4" /> Check Weather
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 w-full">
          <Bell className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      <WeatherCard />
      <CalendarCard />
    </aside>
  );
}
