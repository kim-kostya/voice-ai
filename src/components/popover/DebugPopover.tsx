"use client";

import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { trpc } from "@/lib/trpc";

export function DebugPopover() {
  const { pushNotificationSubscription, setPushNotificationSubscription } =
    useNotificationsStore();
  const sendTestNotification = trpc.push.sendTestNotification.useMutation();
  const subscribe = trpc.push.subscribe.useMutation();

  const handleSendTestNotification = async () => {
    await sendTestNotification.mutateAsync();
  };

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    console.log(permission);
  };

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Wrench className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-6 max-h-[54vh] overflow-hidden">
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            size="icon"
            className="w-full justify-center"
            onClick={subscribeToPushNotifications}
          >
            Subscribe to Push Notifications
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-full justify-center"
            onClick={requestNotificationPermission}
          >
            Request Notification Permission
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-full justify-center"
            onClick={handleSendTestNotification}
          >
            Test Push notification
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function base64Encode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64Decode(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
