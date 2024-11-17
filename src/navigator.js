function updateNetworkStatus() {
    const offline_message = document.querySelector('.offline-message');
    if (navigator.onLine) {
        offline_message.style.display = 'none';
        console.log("Bạn đang trực tuyến");
        
    } else {
        offline_message.style.display = 'block';
        console.log("Bạn đang ngoại tuyến");
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();