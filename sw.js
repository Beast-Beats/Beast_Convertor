const CACHE_NAME = "beast-converter-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./lucide.min.js",
  "./lame.min.js",
  "./browser-id3-writer.min.js"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  // Handle navigation
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME)
                .then(cache => cache.put("./index.html", clone));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Cache First Strategy
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clone));
        return res;
      });
    })
  );
});