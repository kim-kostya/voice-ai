import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { addEventListeners, createSerwist } from "serwist";

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
  const data = event.data?.json() ?? { title: "New Notification" };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body || "You have a new update!",
      icon: "/icons/icon-192x192.png", // Path to your PWA icon
      badge: "/icons/badge-72x72.png", // Small monochrome icon for Android
      data: data.url, // Custom data to use in the click handler
    }),
  );
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
