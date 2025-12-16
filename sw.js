const CACHE_NAME = 'toolverse-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './assets/css/style.css',
  './js/router.js',
  './js/tools.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/marked@4.0.0/marked.min.js',
  'https://kit.fontawesome.com/46f95533a0.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

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
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Cache the new resource for future use
          // We only cache valid responses
          if (fetchResponse.status === 200 && fetchResponse.type === 'basic') {
             cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
        // Fallback for offline if not in cache (e.g. custom offline page)
        // For now, we just let it fail if not in cache and network is down
    })
  );
});
