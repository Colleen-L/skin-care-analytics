import { useState, useCallback, useEffect } from 'react';
import { handleError } from '@/utils/errorHandler';

/**
 * React hook for error display management
 * @param {Object} options - Hook options
 * @param {number} options.autoDismissMs - Auto-dismiss time in milliseconds (0 = no auto-dismiss)
 * @returns {Object} - Error hook interface
 */
export const useError = (options = {}) => {
    const { autoDismissMs = 5000 } = options;
    const [error, setError] = useState(null);
    const [dismissTimer, setDismissTimer] = useState(null);

    /**
     * Shows an error
     * @param {Error|Object|string} errorInput - Error to display
     */
    const showError = useCallback((errorInput) => {
        const handled = handleError(errorInput);
        setError(handled);

        // Clear existing timer
        if (dismissTimer) {
            clearTimeout(dismissTimer);
        }

        // Set auto-dismiss timer if enabled
        if (autoDismissMs > 0) {
            const timer = setTimeout(() => {
                clearError();
            }, autoDismissMs);
            setDismissTimer(timer);
        }
    }, [autoDismissMs, dismissTimer]);

    /**
     * Clears the error
     */
    const clearError = useCallback(() => {
        setError(null);
        if (dismissTimer) {
            clearTimeout(dismissTimer);
            setDismissTimer(null);
        }
    }, [dismissTimer]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (dismissTimer) {
                clearTimeout(dismissTimer);
            }
        };
    }, [dismissTimer]);

    return {
        error,
        showError,
        clearError,
        hasError: error !== null,
    };
};

