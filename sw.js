// Pocket Pet Focus service worker: offline app shell + cached fonts
const CACHE = 'pocketpet-v19';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './privacy.html'];
// art and fonts are cached on first use (fetch handler) so the first install stays small
// art and fonts are cached on first use (fetch handler) so the first install stays small
// art and fonts are cached on first use (fetch handler) so the first install stays small
// art and fonts are cached on first use (fetch handler) so the first install stays small
// art and fonts are cached on first use (fetch handler) so the first install stays small
// art and fonts are cached on first use (fetch handler) so the first install stays small
// art and fonts are cached on first use (fetch handler) so the first install stays small
// art and fonts are cached on first use (fetch handler) so the first install stays small
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Google Fonts: serve from cache, refresh in the background
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request);
      const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  // pages: try the network first so updates show up, fall back to the saved copy offline
  if (url.origin === self.location.origin && (e.request.mode === 'navigate' || url.pathname.endsWith('.html'))) {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
    }).catch(() => caches.match('./index.html'))));
  }
});
