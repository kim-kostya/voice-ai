import { useEffect } from "react";
import { z } from "zod";
import { useAgentRemoteRpcMethod } from "@/lib/hooks/agent";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { trpc } from "@/lib/trpc";

export function ReminderPushNotificationHandler() {
  const { pushNotificationSubscription, setPushNotificationSubscription } =
    useNotificationsStore();
  const subscribe = trpc.push.subscribe.useMutation();

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

  const subscribeToPushNotifications = async () => {
    if (pushNotificationSubscription !== null) return;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.error("Push notifications are not supported");
      return;
    }

    try {
      // 1. Register the Service Worker (if not already done by Serwist/Next)
      const registration = await navigator.serviceWorker.ready;

      // 2. Request Notification Permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Permission denied");
        return;
      }

      // 3. Subscribe using PushManager
      // You need a VAPID Public Key from your backend
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const p256dh = subscription.getKey("p256dh");
      const auth = subscription.getKey("auth");

      if (p256dh === null || auth === null) {
        throw new Error("Failed to extract keys from subscription");
      }

      await subscribe.mutateAsync({
        endpoint: subscription.endpoint,
        p256dh: base64Encode(p256dh),
        auth: base64Encode(auth),
      });
      setPushNotificationSubscription(subscription);

      console.log("User subscribed!", subscription);
    } catch (error) {
      console.error("Failed to subscribe", error);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: run only on mount once
  useEffect(() => {
    subscribeToPushNotifications()
      .then(() => {
        console.log("[PUSH] Subscribed to push notifications");
      })
      .catch((error) => {
        console.error("[PUSH] Failed to subscribe", error);
      });
  }, []);

  return <div style={{ display: "none" }}></div>;
}

function base64Encode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
