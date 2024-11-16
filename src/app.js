if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('src/service-worker.js')
        .then(() => console.log('Service Worker Registered'))
        .catch((error) => console.error('Service Worker Registration Failed:', error));
}