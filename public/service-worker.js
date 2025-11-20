const CACHE_NAME = 'anoteifacil-offline-v3';

// Assets that MUST be cached immediately for the app to boot offline
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Domains that serve our critical scripts (React, Firebase, Icons, Tailwind)
// We must cache these, otherwise the app will be blank offline
const EXTERNAL_DOMAINS_TO_CACHE = [
  'cdn.tailwindcss.com',
  'aistudiocdn.com',
  'www.gstatic.com',
  'placehold.co' // Icons
];

// Install Event: Cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching core assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
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
    }).then(() => self.clients.claim())
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

  // 1. Navigation Requests (HTML): Network First, fallback to Cache
  // This ensures users get the latest version if online, but app works if offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. Asset Requests (JS, CSS, Images, CDNs)
  // Strategy: Stale-While-Revalidate
  // Serve from cache immediately (fast), then update cache from network (fresh next time).
  if (url.origin === self.location.origin || isCachableExternal(url.href)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              // Only cache valid responses
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' || networkResponse.type === 'cors') {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch((err) => {
               // Network failed, nothing to do if we don't have cache
               // console.log('Network fetch failed for', event.request.url);
            });

          // Return cached response if available, otherwise wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});