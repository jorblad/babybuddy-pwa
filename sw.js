importScripts('https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.min.js');

const CACHE_NAME = 'babybuddy-pwa-v5';
const API_CACHE = 'babybuddy-pwa-api-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.min.js'
];

const db = new Dexie('BabyBuddyPWA');
db.version(1).stores({
  config: 'key',
  outbox: '++id, status'
});

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
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== API_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch handler: cache API GET responses for offline, pass POSTs through
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For API GET requests: network-first with cache fallback
  if (url.pathname.includes('/api/') && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For API POSTs (outbox sync): pass through
  if (url.pathname.includes('/api/')) return;

  // App shell: network-first with cache fallback
  event.respondWith(
    (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const networkResponse = await fetch(event.request, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return networkResponse;
      } catch {
        clearTimeout(timeoutId);
        const cached = await caches.match(event.request);
        if (cached) return cached;
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      }
    })()
  );
});

// --- Background Sync (outbox) ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-babybuddy-outbox') {
    event.waitUntil(processBackgroundSync());
  }
});

// --- Periodic Background Sync (Chrome Android) ---
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'poll-babybuddy-history') {
    event.waitUntil(pollHistory());
  }
});

async function pollHistory() {
  const serverObj = await db.config.get('server');
  const tokenObj = await db.config.get('token');
  const childObj = await db.config.get('child');
  if (!serverObj || !tokenObj || !childObj) return;

  const headers = {
    'Authorization': `Token ${tokenObj.value}`,
    'Content-Type': 'application/json'
  };
  const base = serverObj.value;
  const childId = childObj.value;

  try {
    const [changesRes, feedingsRes, sleepRes] = await Promise.all([
      fetch(`${base}/api/changes/?child=${childId}&limit=10`, { headers }),
      fetch(`${base}/api/feedings/?child=${childId}&limit=10`, { headers }),
      fetch(`${base}/api/sleep/?child=${childId}&limit=10`, { headers })
    ]);

    const store = await caches.open(API_CACHE);

    if (changesRes.ok) {
      store.put(`${base}/api/changes/?child=${childId}&limit=10`, changesRes.clone());
    }
    if (feedingsRes.ok) {
      store.put(`${base}/api/feedings/?child=${childId}&limit=10`, feedingsRes.clone());
    }
    if (sleepRes.ok) {
      store.put(`${base}/api/sleep/?child=${childId}&limit=10`, sleepRes.clone());
    }

    // Also cache the children endpoint
    const childrenRes = await fetch(`${base}/api/children/`, { headers });
    if (childrenRes.ok) {
      store.put(`${base}/api/children/`, childrenRes.clone());
    }

    // Notify open clients that fresh data is available
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({ type: 'HISTORY_UPDATED' });
    }
  } catch (err) {
    console.warn('Periodic history poll failed:', err);
  }
}

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
      } else {
        console.error('Sync API error:', res.status, await res.text());
      }
    } catch (err) {
      console.error('Background sync failed:', err);
      break;
    }
  }

  await pollHistory();
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_POLL') {
    event.waitUntil(pollHistory());
  }
});