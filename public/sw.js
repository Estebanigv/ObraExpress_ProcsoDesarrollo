// Service Worker Avanzado para ObraExpress Chile
// Tarea 3.3: Caché y Estado - Service Worker mejorado

const CACHE_NAME = 'obraexpress-v1.1.0';
const API_CACHE_NAME = 'obraexpress-api-v1.1.0';
const IMAGE_CACHE_NAME = 'obraexpress-images-v1.1.0';

const CACHE_ASSETS = [
  '/',
  '/productos',
  '/nosotros',
  '/contacto',
  '/admin',
  '/manifest.json',
  '/assets/images/Logotipo/isotipo_obraexpress.webp',
  '/assets/images/Home/bannerB-q82.webp'
];

// URLs de API que queremos cachear
const API_CACHE_PATTERNS = [
  /^\/api\/productos-publico/,
  /^\/api\/admin\/productos/,
  /^\/api\/admin\/stats/,
  /^\/api\/chatbot/,
];

// URLs de imágenes que queremos cachear
const IMAGE_PATTERNS = [
  /^\/assets\/images\//,
  /\.(jpg|jpeg|png|gif|webp|svg)$/i
];

// Install Event - Precargar recursos críticos
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching core assets');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting to activate immediately');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to precache assets:', error);
      })
  );
});

// Activate Event - Limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de todas las páginas
      self.clients.claim()
    ])
  );
  
  console.log('[SW] Service Worker activated');
});

// Fetch Event - Estrategias diferenciadas por tipo de recurso
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests GET
  if (request.method !== 'GET') return;
  
  // Skip extensiones y dev tools
  if (url.protocol === 'chrome-extension:' || url.protocol === 'devtools:') return;
  
  // Estrategia para API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Estrategia para imágenes
  if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Estrategia para páginas y otros recursos estáticos
  event.respondWith(handleStaticRequest(request));
});

// Manejar requests de API - Network First con fallback a cache
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    console.log('[SW] API Network First:', url.pathname);
    
    // Intentar primero la red
    const networkResponse = await fetch(request);
    
    // Solo cachear respuestas exitosas de APIs específicas
    if (networkResponse.ok && shouldCacheApiRequest(url)) {
      const cache = await caches.open(API_CACHE_NAME);
      // Clonar antes de usar
      cache.put(request, networkResponse.clone());
      console.log('[SW] API cached:', url.pathname);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] API Network failed, trying cache:', url.pathname);
    
    // Fallback a cache si la red falla
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] API served from cache:', url.pathname);
      return cachedResponse;
    }
    
    // Si no hay cache, devolver respuesta offline
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Offline - no cached data available',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Manejar requests de imágenes - Cache First con fallback a network
async function handleImageRequest(request) {
  const url = new URL(request.url);
  
  console.log('[SW] Image Cache First:', url.pathname);
  
  try {
    // Intentar primero el cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Image served from cache:', url.pathname);
      return cachedResponse;
    }
    
    // Si no está en cache, buscar en red
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear la imagen
      const cache = await caches.open(IMAGE_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Image cached:', url.pathname);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Image failed:', url.pathname);
    
    // Devolver placeholder o imagen por defecto
    return new Response('', {
      status: 404,
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

// Manejar requests estáticos - Cache First para assets, Network First para páginas
async function handleStaticRequest(request) {
  const url = new URL(request.url);
  
  // Para assets estáticos (CSS, JS, fonts) usar Cache First
  if (url.pathname.includes('/assets/') || 
      url.pathname.includes('/_next/static/') ||
      url.pathname.match(/\.(css|js|woff|woff2|ttf)$/)) {
    
    console.log('[SW] Static Cache First:', url.pathname);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const networkResponse = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      return new Response('Offline', { status: 503 });
    }
  }
  
  // Para páginas HTML usar Network First
  console.log('[SW] Page Network First:', url.pathname);
  
  try {
    const networkResponse = await fetch(request);
    
    // Cachear páginas exitosas
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Fallback a cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Página offline por defecto
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ObraExpress - Offline</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>Sin conexión</h1>
          <p>No hay conexión a internet. Algunas funciones pueden no estar disponibles.</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Funciones de utilidad
function shouldCacheApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isImageRequest(url) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Escuchar mensajes desde la aplicación
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'CACHE_CLEAN':
      handleCacheClean(payload);
      break;
    case 'CACHE_STATS':
      handleCacheStats(event);
      break;
    case 'PREFETCH':
      handlePrefetch(payload);
      break;
  }
});

// Limpiar cache específico
async function handleCacheClean(payload) {
  const { cacheName } = payload;
  
  try {
    if (cacheName === 'all') {
      // Limpiar todos los caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[SW] All caches cleaned');
    } else {
      // Limpiar cache específico
      await caches.delete(cacheName);
      console.log('[SW] Cache cleaned:', cacheName);
    }
  } catch (error) {
    console.error('[SW] Error cleaning cache:', error);
  }
}

// Obtener estadísticas de cache
async function handleCacheStats(event) {
  try {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      stats[cacheName] = keys.length;
    }
    
    // Enviar estadísticas de vuelta
    event.ports[0].postMessage({
      type: 'CACHE_STATS_RESPONSE',
      payload: stats
    });
    
    console.log('[SW] Cache stats:', stats);
  } catch (error) {
    console.error('[SW] Error getting cache stats:', error);
  }
}

// Prefetch de recursos
async function handlePrefetch(payload) {
  const { urls } = payload;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    
    for (const url of urls) {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        console.log('[SW] Prefetched:', url);
      }
    }
  } catch (error) {
    console.error('[SW] Error prefetching:', error);
  }
}

console.log('[SW] Service Worker script loaded');