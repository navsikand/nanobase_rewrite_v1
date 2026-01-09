/**
 * Phase 2.3: Service Worker Implementation
 * Enables offline support and intelligent caching
 * Implements stale-while-revalidate for APIs
 * Cache-first strategy for static assets
 */

const CACHE_NAME = 'nanobase-v1';
const API_CACHE_NAME = 'nanobase-api-v1';
const ASSET_CACHE_NAME = 'nanobase-assets-v1';

const ASSETS_TO_PRECACHE = [
  '/',
  '/browse',
  '/images/no-structure-img.webp',
];

// Install: precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_PRECACHE);
    })
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if (![CACHE_NAME, API_CACHE_NAME, ASSET_CACHE_NAME].includes(name)) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: implement intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: stale-while-revalidate strategy
  // Check both local API paths and external API origin (api.nanobase.org)
  if (url.pathname.startsWith('/api/') || url.origin.includes('api.nanobase.org')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);

        // Return cached immediately if available
        if (cached) {
          // Revalidate in background
          fetch(request).then((response) => {
            if (response.ok && request.method === 'GET') {
              cache.put(request, response.clone());
            }
          }).catch(() => { });
          return cached;
        }

        // No cache, fetch from network
        try {
          const response = await fetch(request);
          if (response.ok && request.method === 'GET') {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          // Return offline response
          return new Response(
            JSON.stringify({ error: 'Offline' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }
      })
    );
    return;
  }

  // Image/font/style assets: cache-first strategy
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style'
  ) {
    event.respondWith(
      caches.open(ASSET_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          return (
            cached ||
            fetch(request).then((response) => {
              if (response.ok && request.method === 'GET') {
                cache.put(request, response.clone());
              }
              return response;
            })
          );
        });
      })
    );
    return;
  }

  // Default: network-first strategy
  event.respondWith(fetch(request));
});
