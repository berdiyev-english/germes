// Define a cache name, versioning helps manage updates later
const CACHE_NAME = 'my-pwa-cache-v1';

// List of assets to cache during installation
// Be careful with dynamic URLs like those with '?t=' in Tilda.
// For a real Tilda site, you'd need to figure out how Tilda names its final assets
// or use a different caching strategy (like runtime caching).
// For a simple static site (like on GitHub Pages), list your static assets here.
const urlsToCache = [
  '/', // Cache the root path (your index.html)
  '/index.html', // Or your main HTML file
  // Add paths to your main CSS, JS, images, etc.
  // Example based on Tilda code (replace with actual paths if using the GitHub demo):
  // '/css/tilda-grid-3.0.min.css', // Example CSS path
  // '/js/tilda-scripts-3.0.min.js', // Example JS path
  // '/germes/manifest.json', // Path to your manifest file
  // '/germes/icon-192.png', // Path to your app icon
  // Add any other critical assets your app needs offline
];

// Install event: caches static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching assets:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: intercepts network requests and serves from cache or network
self.addEventListener('fetch', (event) => {
  // console.log('Service Worker: Fetching', event.request.url); // Optional: log requests

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If the resource is in the cache, return it
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // If not in cache, fetch from the network
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
             // Optional: cache new successful responses for future use (runtime caching)
             // Make sure to clone the response as it can only be consumed once
             /*
             if (response && response.status === 200 && response.type === 'basic') {
                 const responseToCache = response.clone();
                 caches.open(CACHE_NAME)
                     .then((cache) => {
                         cache.put(event.request, responseToCache);
                     });
             }
             */
            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', event.request.url, error);
            // Optional: Serve an offline page if fetch fails and no cache match
            // return caches.match('/offline.html'); // You would need an offline.html page
          });
      })
  );
});
