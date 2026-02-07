import { useState, useEffect, useCallback } from 'react';

/**
 * React hook for safe LocalStorage access
 * - SSR-safe (checks window exists)
 * - JSON serialization
 * - Error handling
 * - Change detection
 * - Type validation
 * 
 * @param {string} key - LocalStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {[value, setValue, removeValue]} - State tuple
 */
export const useLocalStorage = (key, initialValue) => {
    // SSR-safe: check if window exists
    const isClient = typeof window !== 'undefined';

    // State to store our value
    const [storedValue, setStoredValue] = useState(() => {
        if (!isClient) {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Listen for changes from other tabs/windows
    useEffect(() => {
        if (!isClient) {
            return;
        }

        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch (error) {
                    console.error(`Error parsing storage change for key "${key}":`, error);
                }
            } else if (e.key === key && e.newValue === null) {
                setStoredValue(initialValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, initialValue, isClient]);

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage
    const setValue = useCallback((value) => {
        if (!isClient) {
            return;
        }

        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            // Save state
            setStoredValue(valueToStore);
            
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // Handle quota exceeded and other errors
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                console.error('LocalStorage quota exceeded');
                // Could trigger a cleanup or notify user
            } else {
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        }
    }, [key, storedValue, isClient]);

    // Remove value from localStorage
    const removeValue = useCallback(() => {
        if (!isClient) {
            return;
        }

        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue, isClient]);

    return [storedValue, setValue, removeValue];
};

/**
 * Hook specifically for purchase history with real-time updates
 * @returns {[purchases, refreshPurchases]} - Purchases array and refresh function
 */
export const usePurchaseHistory = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshPurchases = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            setLoading(true);
            const { getAllPurchases } = require('@/services/purchaseLogger');
            const allPurchases = getAllPurchases();
            setPurchases(allPurchases);
        } catch (error) {
            console.error('Error refreshing purchases:', error);
            setPurchases([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshPurchases();

        // Listen for storage changes
        const handleStorageChange = (e) => {
            if (e.key === 'purchaseHistory') {
                refreshPurchases();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [refreshPurchases]);

    return [purchases, refreshPurchases, loading];
};

