import { useEffect } from "react";
import { z } from "zod";
import { useAgentRemoteRpcMethod } from "@/lib/hooks/agent";

export function ReminderPushNotificationHandler() {
  const notifyAboutReminder = useAgentRemoteRpcMethod(
    "reminder_notification",
    z.object({
      reminder: z.object({
        time: z.string(),
        message: z.string(),
      }),
    }),
    z.object({
      type: z.literal("success"),
    }),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: notifyAboutReminder is constant
  useEffect(() => {
    const channel = new BroadcastChannel("reminder-notification-channel");
    const onReminderNotification = async (event: MessageEvent<any>) => {
      await notifyAboutReminder({
        reminder: {
          time: event.data.time,
          message: event.data.text,
        },
      });
    };
    channel.addEventListener("message", onReminderNotification);
    return () => channel.removeEventListener("message", onReminderNotification);
  }, []);

  return <div style={{ display: "none" }}></div>;
}
