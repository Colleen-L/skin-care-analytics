const STORAGE_KEY = 'purchaseHistory';
const STORAGE_VERSION = 1;
const VERSION_KEY = 'purchaseHistory_version';

/**
 * Purchase schema definition
 */
const PURCHASE_SCHEMA = {
    id: 'string',
    productId: 'string',
    productName: 'string',
    price: 'number',
    walletAddress: 'string',
    signature: 'string',
    timestamp: 'string',
    status: 'string', // 'confirmed' | 'pending'
    explorerUrl: 'string',
};

/**
 * Validates purchase data against schema
 * @param {Object} data - Purchase data to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validatePurchaseData = (data) => {
    const errors = [];

    if (!data || typeof data !== 'object') {
        return { valid: false, errors: ['Purchase data must be an object'] };
    }

    // Check required fields
    for (const [field, type] of Object.entries(PURCHASE_SCHEMA)) {
        if (!(field in data)) {
            errors.push(`Missing required field: ${field}`);
        } else {
            const actualType = typeof data[field];
            if (actualType !== type) {
                errors.push(`Field '${field}' must be of type ${type}, got ${actualType}`);
            }
        }
    }

    // Validate specific constraints
    if (data.id && typeof data.id !== 'string') {
        errors.push('Field "id" must be a string');
    }

    if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
        errors.push('Field "price" must be a non-negative number');
    }

    if (data.status && !['confirmed', 'pending'].includes(data.status)) {
        errors.push('Field "status" must be "confirmed" or "pending"');
    }

    if (data.timestamp) {
        const date = new Date(data.timestamp);
        if (isNaN(date.getTime())) {
            errors.push('Field "timestamp" must be a valid ISO date string');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Checks if a purchase already exists (by signature)
 * @param {Array} purchases - Array of existing purchases
 * @param {string} signature - Transaction signature
 * @returns {boolean} - True if duplicate exists
 */
const isDuplicate = (purchases, signature) => {
    return purchases.some(p => p.signature === signature);
};

/**
 * Handles LocalStorage quota errors
 * @param {Error} error - Error object
 * @returns {boolean} - True if quota error was handled
 */
const handleQuotaError = (error) => {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.error('LocalStorage quota exceeded. Clearing old purchases...');
        // Try to clear oldest 50% of purchases
        try {
            const purchases = getAllPurchases();
            const half = Math.floor(purchases.length / 2);
            const recentPurchases = purchases.slice(0, half);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recentPurchases));
            console.log(`Cleared ${half} old purchases to free up space`);
            return true;
        } catch (clearError) {
            console.error('Failed to clear old purchases:', clearError);
            return false;
        }
    }
    return false;
};

/**
 * Migrates storage to current version
 */
export const migrateStorage = () => {
    try {
        const currentVersion = localStorage.getItem(VERSION_KEY);
        
        if (currentVersion === String(STORAGE_VERSION)) {
            return; // Already up to date
        }

        // Migrate from version 0 to 1
        if (!currentVersion || currentVersion === '0') {
            const oldData = localStorage.getItem(STORAGE_KEY);
            if (oldData) {
                try {
                    const purchases = JSON.parse(oldData);
                    // Add missing fields to old purchases
                    const migrated = purchases.map(purchase => ({
                        ...purchase,
                        walletAddress: purchase.walletAddress || 'unknown',
                        status: purchase.status || 'confirmed',
                        price: purchase.price || purchase.solanaAmount || 0,
                    }));
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
                } catch (error) {
                    console.error('Migration error:', error);
                }
            }
        }

        localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION));
    } catch (error) {
        console.error('Storage migration failed:', error);
    }
};

/**
 * Validates integrity of purchase data
 * @param {Array} purchases - Array of purchases
 * @returns {Array} - Valid purchases only
 */
const validateIntegrity = (purchases) => {
    if (!Array.isArray(purchases)) {
        return [];
    }

    return purchases.filter(purchase => {
        const validation = validatePurchaseData(purchase);
        if (!validation.valid) {
            console.warn('Invalid purchase data:', purchase, validation.errors);
            return false;
        }
        return true;
    });
};

/**
 * Saves a purchase to localStorage
 * @param {Object} purchaseData - Purchase data
 * @returns {Array} - Updated purchase history
 */
export const savePurchase = (purchaseData) => {
    try {
        // Validate schema
        const validation = validatePurchaseData(purchaseData);
        if (!validation.valid) {
            throw new Error(`Invalid purchase data: ${validation.errors.join(', ')}`);
        }

        // Ensure timestamp exists
        if (!purchaseData.timestamp) {
            purchaseData.timestamp = new Date().toISOString();
        }

        // Get existing purchases
        const existingPurchases = getAllPurchases();

        // Check for duplicates
        if (isDuplicate(existingPurchases, purchaseData.signature)) {
            console.warn('Duplicate purchase detected, skipping:', purchaseData.signature);
            return existingPurchases;
        }

        // Add to history (newest first)
        const updatedHistory = [purchaseData, ...existingPurchases];

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
    } catch (error) {
        // Handle quota errors
        if (handleQuotaError(error)) {
            // Retry after clearing space
            try {
                const existingPurchases = getAllPurchases();
                const updatedHistory = [purchaseData, ...existingPurchases];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
                return updatedHistory;
            } catch (retryError) {
                console.error('Retry after quota clear failed:', retryError);
            }
        }
        console.error('Error saving purchase:', error);
        return getAllPurchases();
    }
};

/**
 * Gets all purchases from localStorage
 * @returns {Array} - Array of purchases, sorted by date (newest first)
 */
export const getAllPurchases = () => {
    try {
        // Migrate if needed
        migrateStorage();

        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return [];
        }

        let purchases;
        try {
            purchases = JSON.parse(stored);
        } catch (parseError) {
            console.error('Corrupted purchase data, clearing:', parseError);
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }

        // Validate integrity
        const validPurchases = validateIntegrity(purchases);

        // Sort by date (newest first)
        return validPurchases.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error reading purchase history:', error);
        return [];
    }
};

/**
 * Gets a purchase by ID
 * @param {string} id - Purchase ID
 * @returns {Object|null} - Purchase object or null
 */
export const getPurchaseById = (id) => {
    try {
        const purchases = getAllPurchases();
        return purchases.find(p => p.id === id) || null;
    } catch (error) {
        console.error('Error getting purchase by ID:', error);
        return null;
    }
};

/**
 * Deletes a purchase by ID
 * @param {string} id - Purchase ID
 * @returns {boolean} - True if deleted successfully
 */
export const deletePurchase = (id) => {
    try {
        const purchases = getAllPurchases();
        const filtered = purchases.filter(p => p.id !== id);
        
        if (filtered.length === purchases.length) {
            return false; // Purchase not found
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting purchase:', error);
        return false;
    }
};

/**
 * Clears all purchases (for demo/testing)
 */
export const clearAllPurchases = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VERSION_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing purchase history:', error);
        return false;
    }
};

/**
 * Creates a purchase record object
 * @param {Object} params - Purchase parameters
 * @param {Object} params.product - Product object
 * @param {string} params.transactionSignature - Transaction signature
 * @param {string} params.explorerUrl - Solana Explorer URL
 * @param {string} params.walletAddress - Wallet address used (optional)
 * @param {string} params.status - Transaction status (optional, defaults to 'confirmed')
 * @returns {Object} - Purchase record
 */
export const createPurchaseRecord = ({
    product,
    transactionSignature,
    explorerUrl,
    walletAddress = 'unknown',
    status = 'confirmed',
}) => {
    return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        productName: product.name,
        price: product.solana || product.priceSol || 0,
        walletAddress,
        signature: transactionSignature,
        timestamp: new Date().toISOString(),
        status,
        explorerUrl,
    };
};

// Legacy function name for backward compatibility
export const getPurchaseHistory = getAllPurchases;
export const clearPurchaseHistory = clearAllPurchases;
