import type { PushSubscription } from "web-push";
import webpush from "web-push";
import type { PushNotification } from "@/lib/push";
import { db } from "@/server/db";
import { pushSubscriptions } from "@/server/db/schema";

if (!process.env.VAPID_PRIVATE_KEY) {
  throw new Error("Missing VAPID_PRIVATE_KEY env var.");
}

if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  throw new Error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY env var.");
}

webpush.setVapidDetails(
  "mailto:admin@litepas.me",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export async function sendPushNotification(notification: PushNotification) {
  const subscriptions = await db.select().from(pushSubscriptions);
  for (const subscriptionInfo of subscriptions) {
    const subscription: PushSubscription = {
      endpoint: subscriptionInfo.endpoint,
      keys: {
        p256dh: subscriptionInfo.p256dh,
        auth: subscriptionInfo.auth,
      },
    };
    await webpush.sendNotification(subscription, JSON.stringify(notification));
  }
}
