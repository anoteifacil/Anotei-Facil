const CACHE_NAME = 'anoteifacil-v1';
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
  // Skip cross-origin requests like Firebase/Google APIs from caching logic specific to app shell
  // to avoid CORS issues, or handle them with NetworkFirst if needed.
  // For this simple PWA, we prioritize the app shell.
  
  if (event.request.method !== 'GET') return;

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