// Simple notification system fallback for when toastr is not available
const NotificationSystem = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 3000) {
        this.init();
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-weight: 500;
            font-size: 14px;
            max-width: 300px;
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-left: 4px solid ${this.getBorderColor(type)};
        `;
        
        this.container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    },
    
    getBackgroundColor(type) {
        switch (type) {
            case 'success': return 'linear-gradient(135deg, #4caf50, #45a049)';
            case 'error': return 'linear-gradient(135deg, #f44336, #d32f2f)';
            case 'warning': return 'linear-gradient(135deg, #ff9800, #f57c00)';
            case 'info': 
            default: return 'linear-gradient(135deg, #2196f3, #1976d2)';
        }
    },
    
    getBorderColor(type) {
        switch (type) {
            case 'success': return '#2e7d32';
            case 'error': return '#c62828';
            case 'warning': return '#ef6c00';
            case 'info': 
            default: return '#1565c0';
        }
    }
};

// Create toastr compatibility layer
if (typeof toastr === 'undefined') {
    window.toastr = {
        success: (message) => NotificationSystem.show(message, 'success'),
        error: (message) => NotificationSystem.show(message, 'error'),
        warning: (message) => NotificationSystem.show(message, 'warning'),
        info: (message) => NotificationSystem.show(message, 'info')
    };
}