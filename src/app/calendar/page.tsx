"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";

type CalendarEvent = {
  id: number;
  userId: string;
  title: string;
  date: string;
  time: string;
};

export default function CalendarPage() {
  const { data: events, refetch } = api.calendar.getEvents.useQuery();

  const addEvent = api.calendar.addEvent.useMutation({
    onSuccess: () => {
      refetch();
      setTitle("");
      setDate("");
      setTime("");
    },
  });

  const deleteEvent = api.calendar.deleteEvent.useMutation({
    onSuccess: () => refetch(),
  });

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleAdd = () => {
    if (!title || !date || !time) return alert("Fill all fields");
    addEvent.mutate({ title, date, time });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Calendar</h1>

      <div className="border p-4 rounded mb-6 bg-gray-50">
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 w-full mb-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          className="border p-2 w-full mb-4 rounded"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <button
          type="button"
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Add Event
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>

        <div className="space-y-3">
          {events?.length === 0 && (
            <div className="text-gray-500">No events yet.</div>
          )}

          {events?.map((ev: CalendarEvent) => (
            <div
              key={ev.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{ev.title}</div>
                <div className="text-gray-600 text-sm">
                  {ev.date} @ {ev.time}
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteEvent.mutate({ id: ev.id })}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
