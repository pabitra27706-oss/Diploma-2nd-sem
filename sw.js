// ============================================
// SERVICE WORKER - STUDY HUB PWA
// ============================================

const CACHE_NAME = 'study-hub-v1';
const OFFLINE_URL = './offline.html';

// Files to cache immediately on install
const PRECACHE_FILES = [
  './',
  './index.html',
  './css/main.css',
  './js/app.js',
  './js/data.js',
  './offline.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2'
];

// ============ INSTALL ============
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => {
      console.log('[SW] Pre-caching files');
      return cache.addAll(PRECACHE_FILES);
    })
    .then(() => {
      // Activate immediately without waiting
      return self.skipWaiting();
    })
    .catch((err) => {
      console.error('[SW] Pre-cache failed:', err);
    })
  );
});

// ============ ACTIVATE ============
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
    .then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// ============ FETCH ============
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    // Strategy: Network First, fallback to Cache, then Offline page
    fetch(event.request)
    .then((networkResponse) => {
      // If network works, cache the response and return it
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, try cache
      return caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If it's a page request, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          
          // For other resources, return empty response
          return new Response('', {
            status: 408,
            statusText: 'Offline'
          });
        });
    })
  );
});

// ============ BACKGROUND SYNC (Optional) ============
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Force cache update
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(PRECACHE_FILES);
    });
  }
});