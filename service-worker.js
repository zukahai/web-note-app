const CACHE_NAME = 'web-note-app-cache-v5.11';
const urlsToCache = [
    '/',                       // Trang chính
    '/index.html',             // Tệp HTML
    '/assets/css/styles.css',  // CSS
    '/assets/css/nav.css',     // CSS phụ
    '/src/script.js',          // Script chính
    '/src/app.js',             // App logic
    '/src/navigator.js',             // App logic
    '/assets/ico/note.ico'     // Icon
];

// Caching các tệp khi Service Worker được cài đặt
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching app shell');
            return cache.addAll(urlsToCache);
        })
    );
});

// Phục vụ tài nguyên từ cache khi offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
