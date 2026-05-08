/* RK Word Editor demo — minimal stale-while-revalidate service worker. */
const CACHE = 'rk-editor-demo-v1';
const PRECACHE = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;
    if (!request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(request).then((cached) => {
            const fetchPromise = fetch(request)
                .then((response) => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const copy = response.clone();
                        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
                    }
                    return response;
                })
                .catch(() => cached);
            return cached || fetchPromise;
        })
    );
});
