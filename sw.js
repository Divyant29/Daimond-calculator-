// CHANGE THIS VERSION NUMBER EVERY TIME YOU PUSH TO GITHUB
const CACHE_NAME = 'diamond-calc-v1.0.7';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon.png',
  './banner.png',
  './dark-bg.png',
  './light-bg.png'
];

// External CDN libraries the app depends on — must be cached too,
// otherwise the app breaks offline (Firebase, PDF export, barcode scanner)
const CDN_ASSETS_TO_CACHE = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

// Install Event - Cache App Shell + CDN libraries
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(ASSETS_TO_CACHE);
      // Cache CDN assets individually so one failed fetch doesn't block the rest
      await Promise.all(
        CDN_ASSETS_TO_CACHE.map((url) =>
          fetch(url, { mode: 'cors' })
            .then((res) => res.ok && cache.put(url, res))
            .catch(() => {})
        )
      );
    })
  );
});

// Activate Event - Clean up old caches automatically
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Listen for update message from index.html
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Fetch Event - Serve from network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
