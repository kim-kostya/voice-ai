// src/server/google/calendar.ts

import { google } from "googleapis";
import { createOAuthClient } from "./client";

export async function listUpcomingEvents(accessToken: string) {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.data.items ?? [];
}

export async function createSimpleEvent(options: {
  accessToken: string;
  summary: string;
  description?: string;
  start: string; // ISO string
  end: string; // ISO string
}) {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ access_token: options.accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: options.summary,
      description: options.description,
      start: { dateTime: options.start },
      end: { dateTime: options.end },
    },
  });

  return res.data;
}
