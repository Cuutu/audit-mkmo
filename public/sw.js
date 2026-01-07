// Service Worker para PWA
const CACHE_NAME = 'auditoria-obras-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/obras',
  '/manifest.json',
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Cache abierto')
      return cache.addAll(urlsToCache)
    })
  )
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antiguo', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Estrategia: Network First, fallback a Cache (excluyendo APIs)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // No cachear rutas de API (especialmente autenticación)
  if (url.pathname.startsWith('/api/')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (!response.ok) {
          return response
        }

        // Clonar la respuesta
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // Si falla la red, intentar desde el cache
        return caches.match(event.request)
      })
  )
})

