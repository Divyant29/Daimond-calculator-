// CHANGE THIS VERSION NUMBER EVERY TIME YOU PUSH TO GITHUB
const CACHE_NAME = 'diamond-calc-v1.0.27'; 

// Must-have files: if one of these fails, the install stops
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];
// Nice-to-have files (icons, images): saved when possible, but a missing one never blocks the update
const OPTIONAL_ASSETS = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './banner.png',
  './dark-bg.png',
  './light-bg.png'
];

// External libraries the app needs to start (Firebase, PDF, barcode scanner).
// They are saved on the phone too, so the app also opens with NO internet.
// If you change a version number in index.html, change it here as well.
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

// If the internet is slow/unstable, wait only this long before using the saved copy
const NETWORK_TIMEOUT_MS = 4000;

// Save one external library (best effort - never blocks the install)
async function cacheCdnAsset(cache, url) {
  try {
    let res;
    try {
      res = await fetch(url, { mode: 'cors' });
    } catch (e) {
      res = await fetch(url, { mode: 'no-cors' });
    }
    if (res.ok || res.type === 'opaque') {
      await cache.put(url, res);
    }
  } catch (e) {
    // ignore - it will be saved the first time it loads online
  }
}

// Install Event - Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_ASSETS);
      await Promise.all(OPTIONAL_ASSETS.map((u) => cache.add(u).catch(() => {})));
      await Promise.all(CDN_ASSETS.map((url) => cacheCdnAsset(cache, url)));
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

// Own files: network first (so updates arrive right away), but never hang -
// on a slow or missing connection the saved copy is used.
async function networkFirst(event) {
  const req = event.request;

  const fetchPromise = fetch(req).then((res) => {
    if (res && res.status === 200 && res.type === 'basic') {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
    }
    return res;
  });
  event.waitUntil(fetchPromise.catch(() => {})); // let the cache refresh finish in background

  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS);
  });

  try {
    const res = await Promise.race([fetchPromise, timeout]);
    clearTimeout(timer);
    if (res) return res;
  } catch (e) {
    clearTimeout(timer);
  }

  const cached =
    (await caches.match(req, { ignoreSearch: true })) ||
    (req.mode === 'navigate' ? await caches.match('./index.html') : undefined);
  if (cached) return cached;

  // Nothing saved yet: keep waiting for the network (fails only if truly offline)
  return fetchPromise;
}

// External libraries: saved copy first (they never change for a given version)
async function cacheFirst(event) {
  const req = event.request;
  const hit = await caches.match(req.url);
  if (hit) return hit;

  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(req.url, copy));
  }
  return res;
}

// Fetch Event
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (CDN_ASSETS.includes(req.url)) {
    event.respondWith(cacheFirst(event));
    return;
  }

  if (new URL(req.url).origin === self.location.origin) {
    event.respondWith(networkFirst(event));
  }
  // Everything else (Firebase/Google servers, analytics, etc.) is left to the browser as normal
});
