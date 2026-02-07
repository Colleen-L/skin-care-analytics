import { useState, useEffect } from 'react';

const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
};

const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

const iconStyles = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
};

/**
 * Single notification component
 */
function NotificationItem({ notification, onClose }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Fade in animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss if enabled
        if (notification.autoDismiss && notification.duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, notification.duration);

            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(notification.id), 300);
    };

    return (
        <div
            className={`
                border rounded-lg p-4 mb-3 shadow-md transition-all duration-300
                ${typeStyles[notification.type]}
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
            `}
            style={{ minWidth: '300px', maxWidth: '400px' }}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-xl">{iconStyles[notification.type]}</div>
                <div className="flex-1 min-w-0">
                    {notification.title && (
                        <h4 className="font-semibold mb-1">{notification.title}</h4>
                    )}
                    <p className="text-sm">{notification.message}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

/**
 * Notification container component
 * @param {Object} props - Component props
 * @param {string} props.position - Position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
 */
export function NotificationContainer({ position = 'top-right' }) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Listen for custom notification events
        const handleNotification = (event) => {
            const { type, message, title, duration = 5000 } = event.detail;
            addNotification(type, message, title, duration);
        };

        window.addEventListener('showNotification', handleNotification);
        return () => window.removeEventListener('showNotification', handleNotification);
    }, []);

    const addNotification = (type, message, title, duration) => {
        const id = Date.now() + Math.random();
        setNotifications((prev) => [
            ...prev,
            {
                id,
                type,
                message,
                title,
                duration,
                autoDismiss: duration > 0,
            },
        ]);
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
    };

    if (notifications.length === 0) return null;

    return (
        <div
            className={`fixed z-50 ${positionClasses[position]} flex flex-col-reverse`}
            style={{ pointerEvents: 'none' }}
        >
            {notifications.map((notification) => (
                <div key={notification.id} style={{ pointerEvents: 'auto' }}>
                    <NotificationItem
                        notification={notification}
                        onClose={removeNotification}
                    />
                </div>
            ))}
        </div>
    );
}

/**
 * Utility function to show notification
 * @param {string} type - Notification type
 * @param {string} message - Notification message
 * @param {string} title - Optional title
 * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 */
export const showNotification = (type, message, title = null, duration = 5000) => {
    const event = new CustomEvent('showNotification', {
        detail: { type, message, title, duration },
    });
    window.dispatchEvent(event);
};

// Convenience functions
export const showSuccess = (message, title = null, duration = 3000) => {
    showNotification(NOTIFICATION_TYPES.SUCCESS, message, title, duration);
};

export const showError = (message, title = null, duration = 5000) => {
    showNotification(NOTIFICATION_TYPES.ERROR, message, title, duration);
};

export const showInfo = (message, title = null, duration = 4000) => {
    showNotification(NOTIFICATION_TYPES.INFO, message, title, duration);
};

export const showWarning = (message, title = null, duration = 4000) => {
    showNotification(NOTIFICATION_TYPES.WARNING, message, title, duration);
};

export default NotificationContainer;

