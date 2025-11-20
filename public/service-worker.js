const CACHE_NAME = 'anoteifacil-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate and clean old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Stale-While-Revalidate for most resources
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Do not cache remote images/APIs heavily to avoid CORS issues in PWA validation
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
     return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        const fetchPromise = fetch(event.request).then(
           (networkResponse) => {
             // Update cache with new response
             if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
             }
             const responseToCache = networkResponse.clone();
             caches.open(CACHE_NAME)
               .then((cache) => {
                 cache.put(event.request, responseToCache);
               });
             return networkResponse;
           }
        ).catch(() => {
            // If fetch fails (offline), and we don't have it in cache (handled by first .then),
            // check if it's a navigation request and return index.html
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
            }
        });

        return cachedResponse || fetchPromise;
      })
  );
});