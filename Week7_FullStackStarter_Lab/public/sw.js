const CACHE_NAME = 'paus-corner-cache-v3';

// Pages and files saved on install (app shell)
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/app.js',
  '/offline.html',
  '/icon-192.png',
  // Bootstrap from the CDN, so the page keeps its styling offline
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
];

// Install: cache each file separately so one bad URL doesn't break everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(err => console.warn('Not cached:', url, err))
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return; // saving/deleting users needs the server

  const url = new URL(req.url);

  // API data (e.g. /api/users): network first, fall back to last saved copy
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            cached =>
              cached ||
              new Response(JSON.stringify({ error: 'offline' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              })
          )
        )
    );
    return;
  }

  // Everything else: cache first, then network, then offline page
  event.respondWith(
    caches.match(req)
      .then(response => response || fetch(req))
      .catch(() => {
        if (req.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('', { status: 503, statusText: 'Offline' });
      })
  );
});