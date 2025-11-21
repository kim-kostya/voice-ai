import { z } from "zod";
import { google } from "googleapis";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const googleCalendarRouter = createTRPCRouter({
  getEvents: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const oauth = new google.auth.OAuth2();
      oauth.setCredentials({ access_token: input.accessToken });

      const calendar = google.calendar({ version: "v3", auth: oauth });

      const events = await calendar.events.list({
        calendarId: "primary",
        maxResults: 20,
        singleEvents: true,
        orderBy: "startTime",
      });

      return events.data.items ?? [];
    }),

  addEvent: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        summary: z.string(),
        date: z.string(),
        time: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const oauth = new google.auth.OAuth2();
      oauth.setCredentials({ access_token: input.accessToken });

      const calendar = google.calendar({ version: "v3", auth: oauth });

      const dateTime = `${input.date}T${input.time}:00`;

      const event = {
        summary: input.summary,
        start: { dateTime },
        end: { dateTime },
      };

      const result = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      return result.data;
    }),
});
