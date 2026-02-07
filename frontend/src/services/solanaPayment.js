import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

// Custom Error Classes
export class PaymentError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'PaymentError';
        this.code = code;
    }
}

export class WalletNotConnectedError extends PaymentError {
    constructor() {
        super('Wallet is not connected', 'WALLET_NOT_CONNECTED');
        this.name = 'WalletNotConnectedError';
    }
}

export class InsufficientBalanceError extends PaymentError {
    constructor(required, available) {
        super(`Insufficient balance. Required: ${required} SOL, Available: ${available} SOL`, 'INSUFFICIENT_BALANCE');
        this.name = 'InsufficientBalanceError';
        this.required = required;
        this.available = available;
    }
}

export class UserRejectedError extends PaymentError {
    constructor() {
        super('User rejected the transaction', 'USER_REJECTED');
        this.name = 'UserRejectedError';
    }
}

export class NetworkError extends PaymentError {
    constructor(message) {
        super(message || 'Network error occurred', 'NETWORK_ERROR');
        this.name = 'NetworkError';
    }
}

export class TransactionTimeoutError extends PaymentError {
    constructor() {
        super('Transaction confirmation timed out', 'TRANSACTION_TIMEOUT');
        this.name = 'TransactionTimeoutError';
    }
}

/**
 * RECIPIENT WALLET CONFIGURATION
 * 
 * This is the wallet address that will receive all payments.
 * 
 * CONFIGURATION:
 * 1. Create .env.local in /frontend/ directory
 * 2. Add: NEXT_PUBLIC_MERCHANT_WALLET=your_devnet_wallet_address
 * 3. Restart Next.js dev server
 * 
 * Example valid addresses:
 * - Devnet: Any valid Solana public key
 * - Mainnet: Any valid Solana public key (change cluster to 'mainnet-beta' in createConnection)
 * 
 * To get a test wallet address:
 * 1. Use Phantom wallet: Create new wallet, copy address
 * 2. Use Solana CLI: solana-keygen new
 * 3. Use online generator: https://www.sollet.io/
 * 
 * SECURITY NOTE:
 * - Never commit real mainnet wallet addresses to public repositories
 * - Use environment variables for production deployments
 * - Fallback address is for devnet testing only
 */
const MERCHANT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_MERCHANT_WALLET || '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';

/**
 * Validates a Solana wallet address
 * @param {string} address - Wallet address to validate
 * @returns {boolean} - True if valid
 */
export const validateWalletAddress = (address) => {
    try {
        if (!address || typeof address !== 'string') {
            return false;
        }
        const pubkey = new PublicKey(address);
        return PublicKey.isOnCurve(pubkey);
    } catch {
        return false;
    }
};

/**
 * Gets the recipient wallet address
 * @returns {PublicKey} - Recipient wallet public key
 */
export const getRecipientWallet = () => {
    if (!validateWalletAddress(MERCHANT_WALLET_ADDRESS)) {
        throw new Error('Invalid recipient wallet address configured');
    }
    return new PublicKey(MERCHANT_WALLET_ADDRESS);
};

/**
 * Creates a Devnet RPC connection with fallbacks
 * @returns {Connection} - Solana connection
 */
export const createConnection = () => {
    // Primary endpoint
    const primaryEndpoint = 'https://api.devnet.solana.com';
    
    // Fallback endpoints
    const fallbackEndpoints = [
        clusterApiUrl('devnet'),
        'https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY', // Add your API key if needed
    ];

    // Try primary first
    try {
        const connection = new Connection(primaryEndpoint, {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 30000,
        });
        return connection;
    } catch (error) {
        console.warn('Primary endpoint failed, trying fallback:', error);
        // Try fallbacks
        for (const endpoint of fallbackEndpoints) {
            try {
                return new Connection(endpoint, {
                    commitment: 'confirmed',
                    confirmTransactionInitialTimeout: 30000,
                });
            } catch (fallbackError) {
                console.warn('Fallback endpoint failed:', endpoint, fallbackError);
            }
        }
        throw new NetworkError('Unable to establish connection to Solana network');
    }
};

/**
 * Calculates estimated transaction fees
 * @param {number} amountSOL - Amount in SOL
 * @returns {number} - Estimated fee in SOL
 */
export const calculateFees = (amountSOL = 0) => {
    // Base transaction fee is approximately 0.000005 SOL (5000 lamports)
    // This is a conservative estimate
    const baseFee = 0.000005;
    return baseFee;
};

/**
 * Validates a payment transaction on-chain
 * @param {Connection} connection - Solana connection
 * @param {string} signature - Transaction signature
 * @returns {Promise<Object>} - Transaction status and details
 */
export const validatePayment = async (connection, signature) => {
    try {
        if (!connection || !signature) {
            throw new Error('Missing connection or signature');
        }

        const transaction = await connection.getTransaction(signature, {
            commitment: 'confirmed',
        });

        if (!transaction) {
            return {
                valid: false,
                error: 'Transaction not found',
            };
        }

        if (transaction.meta?.err) {
            return {
                valid: false,
                error: transaction.meta.err.toString(),
            };
        }

        return {
            valid: true,
            transaction,
            slot: transaction.slot,
        };
    } catch (error) {
        console.error('Validation error:', error);
        return {
            valid: false,
            error: error.message || 'Validation failed',
        };
    }
};

/**
 * Confirms transaction with retry logic
 * @param {Connection} connection - Solana connection
 * @param {string} signature - Transaction signature
 * @param {number} timeoutMs - Timeout in milliseconds (default 30000)
 * @returns {Promise<Object>} - Confirmation result
 */
const confirmTransactionWithRetry = async (connection, signature, timeoutMs = 30000) => {
    const startTime = Date.now();
    const maxAttempts = 10;
    let attempt = 0;

    while (Date.now() - startTime < timeoutMs && attempt < maxAttempts) {
        try {
            const confirmation = await connection.confirmTransaction(signature, 'confirmed');
            
            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
            }

            return {
                success: true,
                confirmation,
            };
        } catch (error) {
            attempt++;
            if (Date.now() - startTime >= timeoutMs) {
                throw new TransactionTimeoutError();
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.min(1000 * attempt, 3000)));
        }
    }

    throw new TransactionTimeoutError();
};

/**
 * Sends a payment transaction
 * @param {Object} params - Payment parameters
 * @param {Object} params.wallet - Wallet adapter object with publicKey and sendTransaction
 * @param {string} params.recipientAddress - Recipient wallet address (optional, uses default if not provided)
 * @param {number} params.amountSOL - Amount to send in SOL
 * @param {Object} params.productInfo - Product information (optional)
 * @param {Connection} params.connection - Solana connection (optional, creates new if not provided)
 * @returns {Promise<Object>} - Transaction result
 */
export const sendPayment = async ({
    wallet,
    recipientAddress,
    amountSOL,
    productInfo,
    connection,
}) => {
    try {
        // Validate wallet connection
        if (!wallet || !wallet.publicKey) {
            throw new WalletNotConnectedError();
        }

        if (!wallet.sendTransaction) {
            throw new PaymentError('Wallet does not support sending transactions', 'WALLET_NOT_SUPPORTED');
        }

        // Validate amount
        if (!amountSOL || amountSOL <= 0) {
            throw new PaymentError('Invalid payment amount', 'INVALID_AMOUNT');
        }

        // Get or create connection
        const conn = connection || createConnection();

        // Get recipient wallet
        const recipientPubkey = recipientAddress
            ? (validateWalletAddress(recipientAddress) ? new PublicKey(recipientAddress) : getRecipientWallet())
            : getRecipientWallet();

        // Check balance
        const balance = await conn.getBalance(wallet.publicKey);
        const balanceSOL = balance / LAMPORTS_PER_SOL;
        const fee = calculateFees(amountSOL);
        const totalRequired = amountSOL + fee;

        if (balanceSOL < totalRequired) {
            throw new InsufficientBalanceError(totalRequired, balanceSOL);
        }

        // Create transaction
        const lamports = amountSOL * LAMPORTS_PER_SOL;
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: recipientPubkey,
                lamports: lamports,
            })
        );

        // Get recent blockhash
        let blockhash;
        try {
            const { blockhash: recentBlockhash } = await conn.getLatestBlockhash('confirmed');
            blockhash = recentBlockhash;
        } catch (error) {
            throw new NetworkError(`Failed to get recent blockhash: ${error.message}`);
        }

        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        // Send transaction
        let signature;
        try {
            signature = await wallet.sendTransaction(transaction, conn);
        } catch (error) {
            // Check if user rejected
            if (error.message?.includes('User rejected') || error.message?.includes('User cancelled')) {
                throw new UserRejectedError();
            }
            throw new PaymentError(`Transaction send failed: ${error.message}`, 'SEND_FAILED');
        }

        // Confirm transaction with retry
        let confirmationResult;
        try {
            confirmationResult = await confirmTransactionWithRetry(conn, signature, 30000);
        } catch (error) {
            if (error instanceof TransactionTimeoutError) {
                // Transaction was sent but confirmation timed out
                // Return partial success - transaction may still be processing
                return {
                    success: true,
                    signature,
                    confirmed: false,
                    pending: true,
                    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
                    message: 'Transaction sent but confirmation pending',
                };
            }
            throw error;
        }

        // Validate payment on-chain
        const validation = await validatePayment(conn, signature);

        return {
            success: true,
            signature,
            confirmed: true,
            pending: false,
            explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
            validation,
            productInfo,
        };
    } catch (error) {
        // Re-throw custom errors
        if (error instanceof PaymentError) {
            throw error;
        }

        // Handle network errors
        if (error.message?.includes('Network') || error.message?.includes('fetch')) {
            throw new NetworkError(error.message);
        }

        // Generic error
        throw new PaymentError(error.message || 'Payment failed', 'UNKNOWN_ERROR');
    }
};
