// Acalanto Tours service worker.
//
// Cache name bumped on every release to force eviction of stale pages
// (the old homepage didn't show the "Painel Admin" button — bumping the
// cache makes returning users get the fresh shell on their next open).
const CACHE_NAME = 'acalanto-v3'
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

  const url = new URL(e.request.url)

  // Skip auth-sensitive paths entirely — never cache, always network.
  // The admin panel + auth callbacks must always reflect server state.
  const NO_CACHE_PREFIXES = ['/admin', '/api/', '/auth/', '/parceiros/dashboard', '/conta']
  if (NO_CACHE_PREFIXES.some(p => url.pathname === p || url.pathname.startsWith(p + '/') || url.pathname.startsWith(p))) {
    e.respondWith(fetch(e.request))
    return
  }

  // Public pages: network-first with cache fallback (so offline reopens work).
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (!response || response.status === 0) return caches.match(e.request)
        return response
      })
      .catch(() => caches.match(e.request).then(cached => cached || new Response('', { status: 503 })))
  )
})
