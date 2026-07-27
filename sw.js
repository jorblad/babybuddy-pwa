importScripts('https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.min.js');

const CACHE_NAME = 'babybuddy-pwa-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.min.js'
];

// Initialize Dexie inside Service Worker
const db = new Dexie('BabyBuddyPWA');
db.version(1).stores({
  config: 'key',
  outbox: '++id, status'
});

// Install Event: Safely cache assets without crashing on CDN CORS issues
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Skipped caching asset:', asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch handler for offline app shell
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/')) return; // Pass BabyBuddy API through

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {});
      return cachedResponse || fetchPromise;
    })
  );
});

// Background Sync Handler for Queued Outbox Items
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-babybuddy-outbox') {
    event.waitUntil(processBackgroundSync());
  }
});

async function processBackgroundSync() {
  const serverObj = await db.config.get('server');
  const tokenObj = await db.config.get('token');
  if (!serverObj || !tokenObj) return;

  const pendingItems = await db.outbox.where('status').equals('pending').toArray();

  for (const item of pendingItems) {
    try {
      const res = await fetch(`${serverObj.value}/api/${item.endpoint}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${tokenObj.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item.payload)
      });

      if (res.ok) {
        await db.outbox.delete(item.id);
      }
    } catch (err) {
      console.error('Background sync failed:', err);
      break;
    }
  }
}