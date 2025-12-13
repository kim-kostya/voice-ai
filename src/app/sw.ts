import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { addEventListeners, createSerwist } from "serwist";
import { ReminderPushNotification, TestPushNotification } from "@/lib/push";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = createSerwist({
  precache: {
    entries: self.__SW_MANIFEST,
    concurrency: 10,
    cleanupOutdatedCaches: true,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
});

addEventListeners(serwist);

// 2. Add Push Event Listener
self.addEventListener("push", (event) => {
  const data = event.data?.json();

  if (!data) return;
  if (!("type" in data)) return;

  switch (data.type) {
    case "test": {
      const parsedData = TestPushNotification.parse(data);
      event.waitUntil(
        self.registration.showNotification(parsedData.title, {
          body: parsedData.body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          data: "https://voiceai.litepas.me",
        }),
      );
      break;
    }
    case "reminder": {
      const parsedData = ReminderPushNotification.parse(data);

      const channel = new BroadcastChannel("reminder-notification-channel");
      channel.postMessage({
        time: parsedData.time,
        text: parsedData.text,
      });

      event.waitUntil(
        self.registration.showNotification("Reminder", {
          body: parsedData.text,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          data: `/?reminder_id=${parsedData.reminderId}`,
        }),
      );

      break;
    }
  }
});

// 3. Add Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }

        // Otherwise open a new window
        if (clients.openWindow)
          return clients.openWindow(event.notification.data || "/");
      }),
  );
});
