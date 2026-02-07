/**
 * Solana Explorer utilities
 * Supports multiple explorers for user choice
 */

const EXPLORERS = {
    solana: {
        name: 'Solana Explorer',
        baseUrl: 'https://explorer.solana.com',
        accountUrl: (address, network) => 
            `https://explorer.solana.com/address/${address}?cluster=${network}`,
        txUrl: (signature, network) => 
            `https://explorer.solana.com/tx/${signature}?cluster=${network}`,
    },
    solscan: {
        name: 'Solscan',
        baseUrl: 'https://solscan.io',
        accountUrl: (address, network) => 
            network === 'devnet' 
                ? `https://solscan.io/account/${address}?cluster=devnet`
                : `https://solscan.io/account/${address}`,
        txUrl: (signature, network) => 
            network === 'devnet'
                ? `https://solscan.io/tx/${signature}?cluster=devnet`
                : `https://solscan.io/tx/${signature}`,
    },
    solanafm: {
        name: 'SolanaFM',
        baseUrl: 'https://solana.fm',
        accountUrl: (address, network) => 
            `https://solana.fm/address/${address}?cluster=${network}-solana`,
        txUrl: (signature, network) => 
            `https://solana.fm/tx/${signature}?cluster=${network}-solana`,
    },
};

// Default explorer preference (can be stored in localStorage)
const DEFAULT_EXPLORER = 'solana';

/**
 * Validates a Solana transaction signature
 * @param {string} signature - Transaction signature
 * @returns {boolean} - True if valid format
 */
export const validateSignature = (signature) => {
    if (!signature || typeof signature !== 'string') {
        return false;
    }
    // Solana signatures are base58 encoded, typically 88 characters
    // Basic validation: check length and character set
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
    return base58Regex.test(signature);
};

/**
 * Gets explorer URL for a transaction
 * @param {string} signature - Transaction signature
 * @param {string} network - Network ('devnet' | 'mainnet-beta' | 'testnet')
 * @param {string} explorer - Explorer name ('solana' | 'solscan' | 'solanafm')
 * @returns {string} - Explorer URL
 */
export const getExplorerUrl = (signature, network = 'devnet', explorer = DEFAULT_EXPLORER) => {
    if (!validateSignature(signature)) {
        console.warn('Invalid signature format:', signature);
        return '#';
    }

    const explorerConfig = EXPLORERS[explorer] || EXPLORERS[DEFAULT_EXPLORER];
    return explorerConfig.txUrl(signature, network);
};

/**
 * Gets explorer URL for an account/wallet address
 * @param {string} address - Wallet address
 * @param {string} network - Network ('devnet' | 'mainnet-beta' | 'testnet')
 * @param {string} explorer - Explorer name ('solana' | 'solscan' | 'solanafm')
 * @returns {string} - Explorer URL
 */
export const getExplorerAccountUrl = (address, network = 'devnet', explorer = DEFAULT_EXPLORER) => {
    if (!address || typeof address !== 'string') {
        return '#';
    }

    const explorerConfig = EXPLORERS[explorer] || EXPLORERS[DEFAULT_EXPLORER];
    return explorerConfig.accountUrl(address, network);
};

/**
 * Opens transaction in explorer (new tab)
 * @param {string} signature - Transaction signature
 * @param {string} network - Network
 * @param {string} explorer - Explorer name
 */
export const openInExplorer = (signature, network = 'devnet', explorer = DEFAULT_EXPLORER) => {
    const url = getExplorerUrl(signature, network, explorer);
    if (url && url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

/**
 * Gets list of available explorers
 * @returns {Array} - Array of explorer objects
 */
export const getAvailableExplorers = () => {
    return Object.entries(EXPLORERS).map(([key, config]) => ({
        key,
        name: config.name,
        baseUrl: config.baseUrl,
    }));
};

/**
 * Gets user's preferred explorer from localStorage
 * @returns {string} - Explorer key
 */
export const getPreferredExplorer = () => {
    if (typeof window === 'undefined') {
        return DEFAULT_EXPLORER;
    }
    try {
        const preferred = localStorage.getItem('preferredExplorer');
        return preferred && EXPLORERS[preferred] ? preferred : DEFAULT_EXPLORER;
    } catch {
        return DEFAULT_EXPLORER;
    }
};

/**
 * Sets user's preferred explorer
 * @param {string} explorer - Explorer key
 */
export const setPreferredExplorer = (explorer) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        if (EXPLORERS[explorer]) {
            localStorage.setItem('preferredExplorer', explorer);
        }
    } catch (error) {
        console.error('Error setting preferred explorer:', error);
    }
};

