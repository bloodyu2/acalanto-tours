const CACHE_NAME = 'acalanto-v1'
const STATIC_ASSETS = ['/', '/passeios', '/fotografia']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (!response || response.status === 0) return caches.match(e.request)
        return response
      })
      .catch(() => caches.match(e.request).then(cached => cached || new Response('', { status: 503 })))
  )
})
