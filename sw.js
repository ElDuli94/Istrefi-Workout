// Service worker: nyeste versjon fra nett når mulig, lagrede filer når du er offline.
// Øk VERSION ved hver endring av app-filene.
const VERSION = 'v1.6.0';
const CACHE = 'istrefi-' + VERSION;
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/app.css',
  './js/app.js', './js/store.js', './js/db.js', './js/util.js', './js/exercises.js',
  './js/charts.js', './js/muscles.js', './js/extras.js', './js/photos.js', './js/data.js',
  './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png',
  './programs/index.json', './programs/upper-lower-fettreduksjon.json',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' = forbi nettleserens HTTP-cache, så vi aldri lagrer gamle filer.
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function fromNetwork(req) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 4000);
    fetch(req, { cache: 'no-cache' }).then((r) => {
      clearTimeout(t);
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); }
      resolve(r);
    }, (err) => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Nett først (maks 4 sek), deretter lagret kopi.
  e.respondWith(fromNetwork(e.request).catch(() =>
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))));
});
