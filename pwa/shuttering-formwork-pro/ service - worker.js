// Cache name
const CACHE_NAME = 'shuttering - formwork - pro - cache - v1';
// List of files to cache
const urlsToCache = [
    '/',
    '/index.html',
    // Add other CSS, JS, and image files here if needed
];

// Install event
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
          .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
          .then(function (response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Activate event
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.startsWith('shuttering - formwork - pro - cache -') && cacheName!== CACHE_NAME;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

