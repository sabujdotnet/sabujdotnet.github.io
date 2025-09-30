// Service Worker for Shuttering-Pro PWA
const CACHE_NAME = 'shuttering-pro-v1.2';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Assets to cache during installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/app.js',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Install completed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Activate completed');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response for caching
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Periodic background sync for updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-update') {
    console.log('Service Worker: Periodic sync for content updates');
    event.waitUntil(updateContent());
  }
});

// Background sync implementation
async function doBackgroundSync() {
  try {
    // Sync any pending invoices or data
    const pendingInvoices = await getPendingInvoices();
    
    for (const invoice of pendingInvoices) {
      await syncInvoice(invoice);
    }
    
    console.log('Background sync completed successfully');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Get pending invoices from IndexedDB
async function getPendingInvoices() {
  return new Promise((resolve) => {
    const request = indexedDB.open('ShutteringProDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['pendingInvoices'], 'readonly');
      const store = transaction.objectStore('pendingInvoices');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      
      getAllRequest.onerror = () => {
        resolve([]);
      };
    };
    
    request.onerror = () => {
      resolve([]);
    };
  });
}

// Sync individual invoice
async function syncInvoice(invoice) {
  // Implement your sync logic here
  // This would typically send data to your backend
  console.log('Syncing invoice:', invoice.id);
  
  // After successful sync, remove from pending
  await removePendingInvoice(invoice.id);
}

// Remove pending invoice from IndexedDB
async function removePendingInvoice(invoiceId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('ShutteringProDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['pendingInvoices'], 'readwrite');
      const store = transaction.objectStore('pendingInvoices');
      const deleteRequest = store.delete(invoiceId);
      
      deleteRequest.onsuccess = () => {
        resolve(true);
      };
      
      deleteRequest.onerror = () => {
        resolve(false);
      };
    };
    
    request.onerror = () => {
      resolve(false);
    };
  });
}

// Update content in background
async function updateContent() {
  try {
    // Check for app updates
    const cache = await caches.open(STATIC_CACHE);
    const updatedAssets = await checkForUpdates();
    
    if (updatedAssets.length > 0) {
      await cache.addAll(updatedAssets);
      // Notify clients about update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'CONTENT_UPDATED',
            assets: updatedAssets
          });
        });
      });
    }
  } catch (error) {
    console.error('Content update failed:', error);
  }
}

// Check for asset updates
async function checkForUpdates() {
  const updatedAssets = [];
  
  for (const asset of STATIC_ASSETS) {
    try {
      const networkResponse = await fetch(asset, { cache: 'no-cache' });
      const cachedResponse = await caches.match(asset);
      
      if (!cachedResponse || 
          networkResponse.headers.get('etag') !== cachedResponse.headers.get('etag')) {
        updatedAssets.push(asset);
      }
    } catch (error) {
      console.warn(`Failed to check update for ${asset}:`, error);
    }
  }
  
  return updatedAssets;
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Shuttering Pro', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
