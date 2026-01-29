const CACHE_NAME = "alkart-v2026-FINAL-LIVE";

// Mandatory: Skip waiting to ensure immediate update
self.addEventListener("install", (event) => {
    self.skipWaiting();
});

// Mandatory: Clean up ALL old caches and take control
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((key) => caches.delete(key)));
        })
    );
    self.clients.claim();
});

// Mandatory: Network-First strategy for core files
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // For our core app files, always try network first and NEVER cache them
    if (
        url.origin === self.location.origin &&
        (url.pathname.endsWith(".html") ||
            url.pathname.endsWith(".js") ||
            url.pathname.endsWith(".css"))
    ) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Fallback to cache ONLY if network fails and it's in cache
                return caches.match(event.request);
            })
        );
        return;
    }

    // For everything else (like API calls), just fetch directly
    event.respondWith(fetch(event.request));
});
