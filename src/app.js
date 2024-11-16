if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker/service-worker.js')
        .then(() => console.log('Service v2.3 Worker Registered'))
        .catch((error) => console.error('Service Worker Registration Failed:', error));
}