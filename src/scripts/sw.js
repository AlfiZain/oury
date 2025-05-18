import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import CONFIG from "./config";

// Do precaching
precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching
registerRoute(
  ({ url }) => {
    return url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com";
  },
  new CacheFirst({
    cacheName: "google-font",
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return url.origin === baseUrl.origin && request.destination !== "image";
  },
  new NetworkFirst({
    cacheName: "story-api",
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return url.origin === baseUrl.origin && request.destination === "image";
  },
  new StaleWhileRevalidate({
    cacheName: "story-api-images",
  })
);

registerRoute(
  ({ request, url }) => {
    return url.origin.includes("maptiler");
  },
  new CacheFirst({
    cacheName: "maptiler-api",
  })
);

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("[Service worker] pushing...");

  async function showNotification() {
    const data = await event.data.json();

    await self.registration.showNotification(data.title, {
      body: data.options.body,
    });
  }

  event.waitUntil(showNotification());
});
