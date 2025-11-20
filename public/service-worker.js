const CACHE_NAME = 'anoteifacil-offline-v10';

// Assets that MUST be cached immediately for the app to boot offline
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Domains that serve our critical scripts (React, Firebase, Icons, Tailwind)
const EXTERNAL_DOMAINS_TO_CACHE = [
  'cdn.tailwindcss.com',
  'aistudiocdn.com',
  'www.gstatic.com',
  'dummyimage.com',
  'placehold.co',
  'i.imgur.com'
];

// Install Event: Cache core files
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching core assets');
        return cache.addAll(PRECACHE_URLS);
      })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Helper: Check if URL is from an allowed external domain
const isCachableExternal = (url) => {
  return EXTERNAL_DOMAINS_TO_CACHE.some(domain => url.includes(domain));
};

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation Requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try to use the Stale-While-Revalidate strategy
          // First, try to find a match for the exact request (e.g., '/')
          let cachedResponse = await caches.match(event.request);
          
          // If exact match not found, try '/index.html' (App Shell)
          if (!cachedResponse) {
            cachedResponse = await caches.match('/index.html');
          }

          const networkFetch = fetch(event.request).then((networkResponse) => {
            // Update cache in background
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                 // Cache it as the request URL AND /index.html to be safe
                 cache.put(event.request, networkResponse.clone());
                 if (url.pathname === '/' || url.pathname === '/index.html') {
                    cache.put('/index.html', networkResponse.clone());
                 }
              });
            }
            return networkResponse;
          });

          // Return cached response immediately if available (Offline Support)
          // Otherwise wait for network
          return cachedResponse || networkFetch;
        } catch (error) {
          // If everything fails (offline and no cache), try fallback again
          return caches.match('/index.html');
        }
      })()
    );
    return;
  }

  // 2. Asset Requests (JS, CSS, Images, CDNs)
  if (url.origin === self.location.origin || isCachableExternal(url.href)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch((err) => {
               // Network failed
            });
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});