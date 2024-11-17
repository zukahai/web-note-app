if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service v5.1 Worker Registered'))
        .catch((error) => console.error('Service Worker Registration Failed:', error));
}