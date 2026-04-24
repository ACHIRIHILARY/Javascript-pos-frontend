const CACHE_NAME = 'pos-app-v1'
const RUNTIME_CACHE = 'pos-runtime-cache'
const API_CACHE = 'pos-api-cache'

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
]

// Cache allowlist patterns for API requests
const API_PATTERNS = [
  /^http:\/\/localhost:3001\/api/,
  /^https:\/\/api\./,
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets on install')
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.log('[SW] Some static assets could not be cached (expected in dev)')
      })
    })
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            console.log(
              '[SW] Deleting old cache:',
              cacheName
            )
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome extensions and similar
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return
  }

  // API requests: Network first, cache fallback
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response
          }
          const cache = caches.open(API_CACHE)
          cache.then((c) => c.put(request, response.clone()))
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return (
              cached ||
              new Response('Offline - API not available', {
                status: 503,
                statusText: 'Service Unavailable',
              })
            )
          })
        })
    )
    return
  }

  // Static assets: Cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response
            }
            const cache = caches.open(RUNTIME_CACHE)
            cache.then((c) => c.put(request, response.clone()))
            return response
          })
          .catch(() => {
            // Return offline page or placeholder
            if (request.destination === 'document') {
              return caches.match('/')
            }
            return new Response('Offline', { status: 503 })
          })
      )
    })
  )
})

// Helper: check if URL is an API request
function isApiRequest(url) {
  return API_PATTERNS.some((pattern) => pattern.test(url.href))
}
