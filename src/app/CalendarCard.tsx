import { Plus } from "lucide-react";

export default function CalendarCard() {
  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Calendar & Reminders</h3>
        <button className="p-1 rounded-full bg-green-600 text-white" title="Add reminder">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        <input type="date" className="w-full border rounded-lg p-2 text-sm" />
        <div className="text-xs text-gray-500">
          • 10:00 AM – Standup<br />• 2:00 PM – Study Session
        </div>
      </div>
    </div>
  );
}
