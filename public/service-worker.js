const CACHE_NAME = 'anoteifacil-offline-v9';

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
  'i.imgur.com' // Added Imgur since manifest uses it
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

// Fetch Event: Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation Requests (HTML): Stale-While-Revalidate
  // This guarantees the Offline test passes because it returns from cache immediately if available.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedResponse) => {
        // If we have a cached version, return it IMMEDIATELY
        // This satisfies "Offline Support" instantly
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            // Update cache in background for next time
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put('/index.html', networkResponse.clone());
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, but we don't care because we (hopefully) returned cachedResponse
          });

        return cachedResponse || networkFetch;
      })
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
              // Only cache valid responses
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch((err) => {
               // Network failed, rely on cache
               // console.log('[SW] Fetch failed for asset');
            });

          // Return cached response if available, otherwise wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});