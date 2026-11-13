const CACHE = 'mapas-ia-v2';
const SHELL = ['./map.html', './map-manifest.json', './icon-map.png'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('mapas-ia') && k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Cache primero con actualización en segundo plano (solo mismo origen y Tailwind CDN)
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    const ok = e.request.method === 'GET' && (url.origin === location.origin || url.hostname === 'cdn.tailwindcss.com');
    if (!ok) return;
    e.respondWith(
        caches.match(e.request).then(cached => {
            const net = fetch(e.request).then(res => {
                if (res && (res.ok || res.type === 'opaque')) {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, copy));
                }
                return res;
            }).catch(() => cached);
            return cached || net;
        })
    );
});
