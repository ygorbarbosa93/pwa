const OFFLINE_VERSION = 1;
const CACHE_NAME = "offline";
const OFFLINE_URL = "offlinepage";

self.addEventlistener("install", (event) => {
  event.waituntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
    })()
  );
});

self.addEventlistener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondwith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          console.log("Fetch failed; returning offline page instead,", error);

          const cache = await caches.open(CACHE_NAME);
          return await cache.match(OFFLINE_URL);
        }
      })()
    );
  }
});
