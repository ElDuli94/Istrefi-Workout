// Service worker: gjør appen tilgjengelig offline.
// Øk VERSION ved hver endring av app-filene.
const VERSION = 'v1.1.1';
const CACHE = 'istrefi-' + VERSION;
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/app.css',
  './js/app.js', './js/store.js', './js/db.js', './js/util.js', './js/exercises.js',
  './js/charts.js', './js/muscles.js', './js/photos.js', './js/data.js',
  './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png',
  './programs/index.json', './programs/upper-lower-fettreduksjon.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Programmer: nett først (nye programmer fra Claude), cache som reserve.
  if (url.pathname.includes('/programs/')) {
    e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
    return;
  }
  // Resten: cache først, oppdater i bakgrunnen.
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => {
    const net = fetch(e.request).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
