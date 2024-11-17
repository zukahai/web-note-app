let notation = false;

function updateNetworkStatus() {
    if (navigator.onLine) {
        if (notation) {
            toastr.success('Kết nối mạng đã được khôi phục');
        }
    } else {
        toastr.warning('Vẫn có thể sử dụng ứng dụng bình thường');
        toastr.warning('Bạn đang không có kết nối mạng');
        notation = true;
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();