/**
 * Loading spinner component
 * @param {Object} props - Component props
 * @param {string} props.size - Size: 'sm' | 'md' | 'lg'
 * @param {string} props.color - Color: 'primary' | 'white' | 'gray'
 */
export function LoadingSpinner({ size = 'md', color = 'primary' }) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-4',
    };

    const colorClasses = {
        primary: 'border-purple-600 border-t-transparent',
        white: 'border-white border-t-transparent',
        gray: 'border-gray-400 border-t-transparent',
    };

    return (
        <div
            className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}

/**
 * Transaction processing spinner with text
 */
export function TransactionSpinner({ message = 'Processing transaction...' }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-4">
            <LoadingSpinner size="lg" color="primary" />
            <p className="text-sm text-gray-600">{message}</p>
        </div>
    );
}

/**
 * Wallet connection spinner
 */
export function WalletConnectionSpinner() {
    return (
        <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" color="primary" />
            <span className="text-sm text-gray-600">Connecting...</span>
        </div>
    );
}

export default LoadingSpinner;

