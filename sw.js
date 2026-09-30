/* Randomizer Pro — Service Worker
   Strategi: HTML network-first, asset stale-while-revalidate */

const VERSION = 'v18';
const CACHE = 'randomizer-pro-' + VERSION + VERSION + VERSION + VERSION + VERSION + VERSION + VERSION + VERSION;
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './auto-update.js',
  './xlsx.full.min.js',
  './confetti.browser.min.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(CORE.map((url) => c.add(url).catch(() => null)))
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== CACHE && k.startsWith('randomizer-pro-'))
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isHTML =
    req.mode === 'navigate' ||
    req.destination === 'document' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html');

  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200 &&
              (url.origin === self.location.origin ||
               url.hostname === 'cdn.jsdelivr.net')) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
