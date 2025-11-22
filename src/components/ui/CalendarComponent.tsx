"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

type ReminderEvent = {
  id: number;
  text: string;
  time: Date;
};

export function CalendarComponent({ className }: { className?: string }) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Fetch reminders (time = Date)
  const reminders = api.reminders.getReminders.useQuery();

  // Group events by day
  const eventsByDate = React.useMemo(() => {
    if (!reminders.data) return {} as Record<string, ReminderEvent[]>;

    const map: Record<string, ReminderEvent[]> = {};

    reminders.data.forEach((event: ReminderEvent) => {
      const d = new Date(event.time);
      const key = d.toISOString().split("T")[0];

      if (!map[key]) map[key] = [];
      map[key].push(event);
    });

    return map;
  }, [reminders.data]);

  // Events for selected day
  const eventsForSelectedDate = React.useMemo(() => {
    if (!date) return [];
    const key = date.toISOString().split("T")[0];
    return eventsByDate[key] || [];
  }, [date, eventsByDate]);

  return (
    <TooltipProvider>
      <div className={cn("rounded-md border p-4", className)}>
        <h2 className="text-lg font-semibold mb-4">Calendar</h2>

        <div className="relative">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow-sm"
          />

          {/* Dots overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {Object.entries(eventsByDate).map(([key, events]) => {
              const dotDate = new Date(key);

              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute w-5 h-5"
                      style={{
                        top: `calc(((${(
                          (dotDate.getDate() +
                            dotDate.getDay() +
                            6) /
                          7
                        ).toFixed(0)}) * 38px) + 70px)`,
                        left: `calc(((${dotDate.getDay()}) * 38px) + 14px)`,
                      }}
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto" />
                    </div>
                  </TooltipTrigger>

                  <TooltipContent side="bottom">
                    <p className="font-semibold mb-1">Events</p>
                    <ul className="text-sm space-y-1">
                      {events.slice(0, 3).map((e) => (
                        <li key={e.id}>• {e.text}</li>
                      ))}
                      {events.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{events.length - 3} more
                        </p>
                      )}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Event List Under Calendar */}
        <div className="mt-6">
          <h3 className="text-md font-semibold">
            Events on {date?.toDateString()}:
          </h3>

          {eventsForSelectedDate.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">No events.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {eventsForSelectedDate.map((event) => (
                <li
                  key={event.id}
                  className="p-3 border rounded-md bg-accent text-accent-foreground"
                >
                  <p className="font-medium">{event.text}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
