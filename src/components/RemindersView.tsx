"use client";

import * as React from "react";
import type { DayButton } from "react-day-picker";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

type Reminder = {
  id: number;
  text: string;
  time: Date;
};

function toDayKey(d: Date) {
  // local day key (avoids UTC shifting the day when grouping)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayHeader(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RemindersView({ className }: { className?: string }) {
  const { data, isLoading, isError } = trpc.reminders.getReminders.useQuery(
    undefined,
    {
      refetchInterval: 5_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  );

  const [selectedDay, setSelectedDay] = React.useState<Date>(() => new Date());

  const remindersByDay = React.useMemo(() => {
    const map = new Map<string, Reminder[]>();
    for (const r of data ?? []) {
      const key = toDayKey(r.time);
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    for (const [key, list] of map) {
      list.sort((a, b) => a.time.getTime() - b.time.getTime());
      map.set(key, list);
    }
    return map;
  }, [data]);

  const selectedKey = toDayKey(selectedDay);
  const selectedReminders = remindersByDay.get(selectedKey) ?? [];

  const hasReminders = React.useCallback(
    (date: Date) => (remindersByDay.get(toDayKey(date))?.length ?? 0) > 0,
    [remindersByDay],
  );

  const RemindersDayButton = React.useCallback(
    function RemindersDayButton(props: React.ComponentProps<typeof DayButton>) {
      const date = props.day.date;
      const key = toDayKey(date);
      const list = remindersByDay.get(key) ?? [];
      const showDot = list.length > 0;

      const tooltipItems = list.slice(0, 4);

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <CalendarDayButton
                {...props}
                className={cn(
                  props.className,
                  showDot && "data-[selected-single=true]:shadow-none",
                )}
              />
              {showDot ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary",
                    // if the day is selected, keep dot visible on primary background
                    props.modifiers.selected && "bg-primary-foreground",
                  )}
                />
              ) : null}
            </div>
          </TooltipTrigger>

          {showDot ? (
            <TooltipContent side="top" sideOffset={6} className="max-w-65">
              <div className="flex flex-col gap-1">
                <div className="font-medium">{formatDayHeader(date)}</div>
                <div className="opacity-90">
                  {tooltipItems.map((r) => (
                    <div key={r.id} className="truncate">
                      {formatTime(r.time)} — {r.text}
                    </div>
                  ))}
                  {list.length > tooltipItems.length ? (
                    <div className="opacity-80">
                      +{list.length - tooltipItems.length} more…
                    </div>
                  ) : null}
                </div>
              </div>
            </TooltipContent>
          ) : null}
        </Tooltip>
      );
    },
    [remindersByDay],
  );

  return (
    <div className="w-full">
      <div className={cn(className)}>
        <div className="shrink-0">
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={(d) => d && setSelectedDay(d)}
            showOutsideDays
            // used for keyboard focus/selection behavior, and easy checks if needed later
            modifiers={{
              hasReminders,
            }}
            components={{
              DayButton: RemindersDayButton,
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">
              {formatDayHeader(selectedDay)}
            </div>
            <div className="text-xs text-muted-foreground">
              {isLoading
                ? "Loading…"
                : isError
                  ? "Failed to load"
                  : `${selectedReminders.length} reminder(s)`}
            </div>
          </div>

          <div className="mt-2 rounded-md border bg-card">
            <ScrollArea className="max-h-24 overflow-y-auto w-full">
              <div className="p-3 h-fit w-full max-w-60">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading reminders…
                  </div>
                ) : isError ? (
                  <div className="text-sm text-destructive">
                    Couldn’t load reminders. Please try again.
                  </div>
                ) : selectedReminders.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No reminders for this day.
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {selectedReminders.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-start justify-between gap-3 rounded-md border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {r.text}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(r.time)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
