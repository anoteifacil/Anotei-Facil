const CACHE_NAME = 'anoteifacil-offline-v8';

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
  'placehold.co'
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

// Fetch Event: Robust Offline Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation Requests (HTML): Network First, Immediate Fallback to Cache
  // This logic is critical for PWABuilder's "Offline Support" check.
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Attempt network first to get latest version
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        // Network failed (Offline) -> Serve App Shell (index.html)
        console.log('[SW] Offline detected. Serving cached App Shell.');
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/index.html');
        
        if (cachedResponse) {
          return cachedResponse;
        }
        // If index.html isn't in cache (shouldn't happen), let the browser handle the error
        throw error;
      }
    })());
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
               // console.log('Fetch failed for asset, relying on cache');
            });

          // Return cached response if available, otherwise wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});