const CACHE_NAME = 'offline-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/css/nav.css',
    '/assets/ico/note.ico',
    '/src/js/script.js',
    '/src/js/app.js',
];

// Lưu các tài nguyên vào cache khi Service Worker được cài đặt
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching resources');
            return cache.addAll(urlsToCache);
        })
    );
});

// Phục vụ tài nguyên từ cache khi có yêu cầu
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Trả về tài nguyên từ cache nếu có, ngược lại tải từ mạng
            return response || fetch(event.request).catch(() => {
                // Nếu không có mạng, trả về trang offline
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});

// Dọn dẹp cache cũ khi cần thiết
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});