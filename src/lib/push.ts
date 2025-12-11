import { z } from "zod";

export const TestPushNotification = z.object({
  type: z.literal("test"),
  title: z.string(),
  body: z.string(),
});

export const ReminderPushNotification = z.object({
  type: z.literal("reminder"),
  reminderId: z.number(),
  textContent: z.string(),
});

export type PushNotification =
  | z.infer<typeof TestPushNotification>
  | z.infer<typeof ReminderPushNotification>;
