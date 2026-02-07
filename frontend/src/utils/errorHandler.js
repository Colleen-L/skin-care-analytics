/**
 * Centralized error management system
 */

// Error type constants
export const ERROR_TYPES = {
    WALLET_NOT_CONNECTED: 'WalletNotConnected',
    INSUFFICIENT_BALANCE: 'InsufficientBalance',
    TRANSACTION_REJECTED: 'TransactionRejected',
    NETWORK_ERROR: 'NetworkError',
    TIMEOUT_ERROR: 'TimeoutError',
    INVALID_AMOUNT: 'InvalidAmount',
    PRODUCT_NOT_FOUND: 'ProductNotFound',
    UNKNOWN_ERROR: 'UnknownError',
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
    [ERROR_TYPES.WALLET_NOT_CONNECTED]: 'Please connect your wallet to continue',
    [ERROR_TYPES.INSUFFICIENT_BALANCE]: 'Insufficient balance. Please add more SOL to your wallet',
    [ERROR_TYPES.TRANSACTION_REJECTED]: 'Transaction was cancelled',
    [ERROR_TYPES.NETWORK_ERROR]: 'Network error. Please check your connection and try again',
    [ERROR_TYPES.TIMEOUT_ERROR]: 'Transaction is taking longer than expected. Please check your wallet',
    [ERROR_TYPES.INVALID_AMOUNT]: 'Invalid payment amount',
    [ERROR_TYPES.PRODUCT_NOT_FOUND]: 'Product not found',
    [ERROR_TYPES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again',
};

/**
 * Classifies error and returns user-friendly message
 * @param {Error|Object|string} error - Error object or message
 * @returns {Object} - { type, message, originalError }
 */
export const handleError = (error) => {
    let errorType = ERROR_TYPES.UNKNOWN_ERROR;
    let message = ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR];
    let originalError = error;

    // Handle string errors
    if (typeof error === 'string') {
        message = error;
        originalError = new Error(error);
    }
    // Handle Error objects
    else if (error instanceof Error) {
        originalError = error;
        const errorMessage = error.message.toLowerCase();
        const errorName = error.name || '';

        // Check error name/type
        if (errorName.includes('WalletNotConnected') || errorMessage.includes('wallet') && errorMessage.includes('connect')) {
            errorType = ERROR_TYPES.WALLET_NOT_CONNECTED;
            message = ERROR_MESSAGES[errorType];
        } else if (errorName.includes('InsufficientBalance') || errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
            errorType = ERROR_TYPES.INSUFFICIENT_BALANCE;
            message = ERROR_MESSAGES[errorType];
        } else if (errorName.includes('UserRejected') || errorName.includes('TransactionRejected') || errorMessage.includes('reject') || errorMessage.includes('cancel')) {
            errorType = ERROR_TYPES.TRANSACTION_REJECTED;
            message = ERROR_MESSAGES[errorType];
        } else if (errorName.includes('NetworkError') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
            errorType = ERROR_TYPES.NETWORK_ERROR;
            message = ERROR_MESSAGES[errorType];
        } else if (errorName.includes('Timeout') || errorMessage.includes('timeout')) {
            errorType = ERROR_TYPES.TIMEOUT_ERROR;
            message = ERROR_MESSAGES[errorType];
        } else if (errorMessage.includes('invalid') && errorMessage.includes('amount')) {
            errorType = ERROR_TYPES.INVALID_AMOUNT;
            message = ERROR_MESSAGES[errorType];
        } else if (errorMessage.includes('product') && errorMessage.includes('not found')) {
            errorType = ERROR_TYPES.PRODUCT_NOT_FOUND;
            message = ERROR_MESSAGES[errorType];
        } else {
            // Use error message if available
            message = error.message || message;
        }
    }
    // Handle error objects with code/message
    else if (error && typeof error === 'object') {
        originalError = error;
        
        // Check for error code
        if (error.code) {
            const codeMap = {
                'WALLET_NOT_CONNECTED': ERROR_TYPES.WALLET_NOT_CONNECTED,
                'INSUFFICIENT_BALANCE': ERROR_TYPES.INSUFFICIENT_BALANCE,
                'USER_REJECTED': ERROR_TYPES.TRANSACTION_REJECTED,
                'NETWORK_ERROR': ERROR_TYPES.NETWORK_ERROR,
                'TRANSACTION_TIMEOUT': ERROR_TYPES.TIMEOUT_ERROR,
                'INVALID_AMOUNT': ERROR_TYPES.INVALID_AMOUNT,
            };
            
            errorType = codeMap[error.code] || ERROR_TYPES.UNKNOWN_ERROR;
            message = error.message || ERROR_MESSAGES[errorType];
        } else if (error.message) {
            message = error.message;
        }
    }

    return {
        type: errorType,
        message,
        originalError,
    };
};

/**
 * Gets appropriate error component props
 * @param {Object} error - Handled error object
 * @returns {Object} - Component props
 */
export const getErrorComponent = (error) => {
    const handled = handleError(error);
    
    const componentProps = {
        type: 'error',
        message: handled.message,
        errorType: handled.type,
    };

    // Add specific styling/actions based on error type
    switch (handled.type) {
        case ERROR_TYPES.WALLET_NOT_CONNECTED:
            componentProps.action = 'Connect Wallet';
            componentProps.actionType = 'primary';
            break;
        case ERROR_TYPES.INSUFFICIENT_BALANCE:
            componentProps.action = 'Get SOL';
            componentProps.actionType = 'secondary';
            break;
        case ERROR_TYPES.NETWORK_ERROR:
            componentProps.action = 'Retry';
            componentProps.actionType = 'primary';
            break;
        default:
            componentProps.action = 'Dismiss';
            componentProps.actionType = 'secondary';
    }

    return componentProps;
};

/**
 * Logs error with context
 * @param {Error|Object|string} error - Error to log
 * @param {Object} context - Additional context
 */
export const logError = (error, context = {}) => {
    const handled = handleError(error);
    
    const logData = {
        error: {
            type: handled.type,
            message: handled.message,
            original: handled.originalError,
        },
        context,
        timestamp: new Date().toISOString(),
    };

    // Console logging
    console.error('Error occurred:', logData);

    // In production, you might want to send to error tracking service
    // Example: Sentry.captureException(handled.originalError, { extra: context });
    
    return logData;
};

