self.addEventListener("push", (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icons/icon-512x512.png",
      badge: data.badge || "/icons/badge-64x64.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
    // self.postMessage("next_push", event);
  }
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(clients.openWindow("https://voiceai.litepas.me?"));
});
