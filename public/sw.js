const CACHE_NAME = "hos-admin-v2";
const ADMIN_FALLBACK = "/admin";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        const fallback = await caches.match(ADMIN_FALLBACK);
        if (fallback) return fallback;
        return new Response("Offline", { status: 503, statusText: "Offline" });
      })
  );
});
