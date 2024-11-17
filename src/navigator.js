function updateNetworkStatus() {
    const offline_message = document.querySelector('.offline-message');
    if (navigator.onLine) {
        offline_message.style.display = 'none';
        toastr.success('Bạn đang trực tuyến');
        
    } else {
        offline_message.style.display = 'block';
        toastr.warning('Bạn đang ngoại tuyến');
        tpastr.warning('Vẫn có thể sử dụng ứng dụng');
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();