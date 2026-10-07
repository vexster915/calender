// Offline support. Network-first so updates show up right away; cache is the fallback.
// Only the app's own static files are cached — your planner data lives encrypted in IndexedDB, never here.
const CACHE = 'orbit-v12';
const ASSETS = [
  './',
  'index.html',
  'css/style.css',
  'js/app.js',
  'js/util.js',
  'js/vault.js',
  'js/logic.js',
  'js/parse.js',
  'js/views.js',
  'js/ui.js',
  'js/files.js',
  'js/attach.js',
  'js/study.js',
  'js/srs.js',
  'js/gen.js',
  'js/pdf.js',
  'js/ap.js',
  'js/apcatalog.js',
  'js/apparse.js',
  'js/aptopics.js',
  'js/focus.js',
  'js/games.js',
  'js/catalog.js',
  'js/bluebook.js',
  'js/dvcatalog.js',
  'js/dvcurriculum.js',
  'js/dvoutcomes.js',
  'js/cur-ela-math.js',
  'js/cur-sci-ss.js',
  'js/cur-lang-cte.js',
  'js/cur-deep.js',
  'js/cur-deep-lang.js',
  'js/cur-augment.js',
  'js/terms-cte.js',
  'js/stdkit.js',
  'js/azstandards.js',
  'vendor/pdfjs/pdf.min.mjs',
  'vendor/pdfjs/pdf.worker.min.mjs',
  'icons/icon.svg',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('index.html'))),
  );
});
