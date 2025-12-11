import { useEffect } from "react";
import { z } from "zod";
import { useAgentRemoteRpcMethod } from "@/lib/hooks/agent";

export function ReminderPushNotificationHandler() {
  const notifyAboutReminder = useAgentRemoteRpcMethod(
    "notify_about_reminder",
    z.object({
      reminder: z.object({
        time: z.string(),
        text: z.string(),
      }),
    }),
    z.object({
      type: z.literal("success"),
    }),
  );

  useEffect(() => {
    const channel = new BroadcastChannel("reminder-notification-channel");
    const onReminderNotification = async (event: MessageEvent<any>) => {
      console.log("Received reminder notification:", event.data);
      await notifyAboutReminder({
        reminder: {
          time: event.data.time,
          text: event.data.text,
        },
      });
    };
    channel.addEventListener("message", onReminderNotification);
    return () => channel.removeEventListener("message", onReminderNotification);
  }, [notifyAboutReminder]);

  return <div style={{ display: "none" }}></div>;
}
