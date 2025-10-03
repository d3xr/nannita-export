const CACHE_NAME = 'nannita-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/agreement.html',
  '/privacy.html',
  '/personal-data-consent.html',
  '/recommendations.html',
  '/offer.html',
  '/for-specialists.html',
  '/order-new.html',
  '/auth.html',
  '/search-results.html',
  '/nanny-profile.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/images/logo-black.png',
  '/images/logo-white.png',
  '/images/Shield_icon_Nannita_style_3133951c.png',
  '/images/Users_icon_Nannita_style_64086c64.png',
  '/images/Checkmark_icon_Nannita_style_5e03753c.png',
  '/images/Clock_icon_Nannita_style_eeb916b4.png'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[Service Worker] Cache installation failed:', err);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...', event);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch(err => {
          console.error('[Service Worker] Fetch failed:', err);
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
