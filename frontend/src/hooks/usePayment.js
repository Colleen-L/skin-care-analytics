import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { sendPayment } from '@/services/solanaPayment';
import {
    PaymentError,
    WalletNotConnectedError,
    InsufficientBalanceError,
    UserRejectedError,
    NetworkError,
    TransactionTimeoutError,
} from '@/services/solanaPayment';

/**
 * React hook for payment flow management
 * @returns {Object} - Payment hook interface
 */
export const usePayment = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [signature, setSignature] = useState(null);
    const [transactionStatus, setTransactionStatus] = useState(null); // 'pending' | 'confirmed' | 'failed'

    /**
     * Processes a purchase
     * @param {Object} product - Product object
     * @returns {Promise<Object>} - Transaction result
     */
    const processPurchase = useCallback(async (product) => {
        // Reset states
        setLoading(true);
        setError(null);
        setSuccess(false);
        setSignature(null);
        setTransactionStatus(null);

        try {
            // Validate product
            if (!product || !product.solana) {
                throw new PaymentError('Invalid product', 'INVALID_PRODUCT');
            }

            // Process payment
            const result = await sendPayment({
                wallet,
                amountSOL: product.solana,
                productInfo: {
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                },
                connection,
            });

            // Update success state
            setSuccess(true);
            setSignature(result.signature);
            setTransactionStatus(result.confirmed ? 'confirmed' : 'pending');

            return result;
        } catch (err) {
            // Handle different error types
            let errorMessage = 'Payment failed';
            let errorCode = 'UNKNOWN_ERROR';

            if (err instanceof WalletNotConnectedError) {
                errorMessage = 'Please connect your wallet';
                errorCode = 'WALLET_NOT_CONNECTED';
            } else if (err instanceof InsufficientBalanceError) {
                errorMessage = `Insufficient balance. You need ${err.required.toFixed(4)} SOL but only have ${err.available.toFixed(4)} SOL`;
                errorCode = 'INSUFFICIENT_BALANCE';
            } else if (err instanceof UserRejectedError) {
                errorMessage = 'Transaction was cancelled';
                errorCode = 'USER_REJECTED';
            } else if (err instanceof NetworkError) {
                errorMessage = 'Network error. Please try again.';
                errorCode = 'NETWORK_ERROR';
            } else if (err instanceof TransactionTimeoutError) {
                errorMessage = 'Transaction is pending. Please check your wallet.';
                errorCode = 'TRANSACTION_TIMEOUT';
            } else if (err instanceof PaymentError) {
                errorMessage = err.message;
                errorCode = err.code;
            } else {
                errorMessage = err.message || 'An unexpected error occurred';
            }

            setError({
                message: errorMessage,
                code: errorCode,
            });
            setTransactionStatus('failed');

            throw err;
        } finally {
            setLoading(false);
        }
    }, [wallet, connection]);

    /**
     * Resets all payment states
     */
    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setSuccess(false);
        setSignature(null);
        setTransactionStatus(null);
    }, []);

    return {
        processPurchase,
        loading,
        error,
        success,
        signature,
        transactionStatus,
        reset,
    };
};

