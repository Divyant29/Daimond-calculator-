const cacheName = 'diamond-mgr-v2';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Install Service Worker and cache essential files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching app shell');
      return cache.addAll(assets);
    })
  );
});

// Activate and remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Serve files from cache when offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});
