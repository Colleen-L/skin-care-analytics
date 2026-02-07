import { useState, useCallback, useRef } from 'react';
import { usePayment } from '@/hooks/usePayment';
import { useWallet } from '@solana/wallet-adapter-react';
import { savePurchase, createPurchaseRecord } from '@/services/purchaseLogger';
import { debounce } from '@/utils/debounce';
import { showError, showSuccess } from '@/components/Notification';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ProductCard({ product, onPurchaseSuccess, onViewDetails }) {
    const [imageError, setImageError] = useState(false);
    const [buttonState, setButtonState] = useState('default'); // 'default' | 'loading' | 'success' | 'error'
    const [isProcessing, setIsProcessing] = useState(false);
    const { publicKey } = useWallet();
    const purchaseRef = useRef(null);
    
    const {
        processPurchase,
        loading,
        error,
        signature,
        transactionStatus,
        reset,
    } = usePayment();

    const getCompatibilityColor = (score) => {
        if (score >= 90) return 'text-green-600 bg-green-50';
        if (score >= 80) return 'text-yellow-600 bg-yellow-50';
        return 'text-orange-600 bg-orange-50';
    };

    // Debounced purchase handler to prevent double-clicks
    const handlePurchaseDebounced = useCallback(
        debounce(async () => {
            if (isProcessing || loading) return;

            setIsProcessing(true);
            setButtonState('loading');

            try {
                const result = await processPurchase(product);

                if (result.success) {
                    // Log purchase
                    const purchase = createPurchaseRecord({
                        product,
                        transactionSignature: result.signature,
                        explorerUrl: result.explorerUrl,
                        walletAddress: publicKey?.toString() || 'unknown',
                        status: result.confirmed ? 'confirmed' : 'pending',
                    });
                    savePurchase(purchase);

                    // Show success state
                    setButtonState('success');
                    showSuccess('Purchase successful!', null, 3000);

                    // Clear success after 3 seconds
                    setTimeout(() => {
                        setButtonState('default');
                        reset();
                        setIsProcessing(false);
                    }, 3000);

                    // Callback
                    if (onPurchaseSuccess) {
                        onPurchaseSuccess({
                            product,
                            signature: result.signature,
                            explorerUrl: result.explorerUrl,
                            status: result.confirmed ? 'confirmed' : 'pending',
                        });
                    }
                }
            } catch (err) {
                // Show error state with shake animation
                setButtonState('error');
                const errorMessage = error?.message || err.message || 'Purchase failed';
                showError(errorMessage);

                // Clear error after 5 seconds
                setTimeout(() => {
                    setButtonState('default');
                    reset();
                    setIsProcessing(false);
                }, 5000);
            }
        }, 300),
        [product, isProcessing, loading, processPurchase, publicKey, onPurchaseSuccess, error, reset]
    );

    const handlePurchase = () => {
        if (isProcessing || loading) return;
        handlePurchaseDebounced();
    };

    const getButtonContent = () => {
        switch (buttonState) {
            case 'loading':
                return (
                    <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" color="white" />
                        {transactionStatus === 'pending' ? 'Confirming...' : 'Processing...'}
                    </span>
                );
            case 'success':
                return (
                    <span className="flex items-center justify-center gap-2">
                        <span className="text-lg animate-bounce">✓</span>
                        Success!
                    </span>
                );
            case 'error':
                return 'Try Again';
            default:
                return 'Buy with SOL';
        }
    };

    const getButtonClass = () => {
        const baseClass = 'flex-1 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
        
        switch (buttonState) {
            case 'loading':
                return `${baseClass} bg-purple-600 text-white cursor-wait`;
            case 'success':
                return `${baseClass} bg-green-600 text-white`;
            case 'error':
                return `${baseClass} bg-red-600 text-white hover:bg-red-700 animate-shake`;
            default:
                return `${baseClass} bg-purple-600 text-white hover:bg-purple-700`;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
            <div className="h-48 bg-gray-100 overflow-hidden relative">
                {!imageError ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-purple-100">
                        <div className="text-6xl">🧴</div>
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCompatibilityColor(product.compatibility)}`}>
                        {product.compatibility}% Match
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.brand}</p>

                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {product.benefits?.slice(0, 3).map((benefit, idx) => (
                            <span key={idx} className="px-2 py-1 bg-rose-50 text-rose-600 text-xs rounded-full">
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                    <div className="flex items-center text-purple-600">
                        <span className="text-sm font-semibold">{product.solana} SOL</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onViewDetails(product)}
                        disabled={isProcessing || loading}
                        className="flex-1 bg-rose-600 text-white py-2 rounded-lg font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        View Details
                    </button>
                    <button
                        onClick={handlePurchase}
                        disabled={isProcessing || loading || buttonState === 'success'}
                        className={getButtonClass()}
                    >
                        {getButtonContent()}
                    </button>
                </div>
            </div>
        </div>
    );
}
