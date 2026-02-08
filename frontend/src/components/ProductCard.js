import { useState, useCallback } from 'react';
import { usePayment } from '@/hooks/usePayment';
import { debounce } from '@/utils/debounce';
import { showError, showSuccess } from '@/components/Notification';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ProductCard({ product, onPurchaseSuccess, onViewDetails }) {
    const [imageError, setImageError] = useState(false);
    const [buttonState, setButtonState] = useState('default'); // 'default' | 'loading' | 'success' | 'error'
    const [isProcessing, setIsProcessing] = useState(false);
    
    const {
        processPurchase,
        loading,
        error,
        signature,
        transactionStatus,
        reset,
    } = usePayment();

    const getCompatibilityColor = (score) => {
        if (score >= 90) return { bg: '#D4E8D4', text: '#5A8B5A' };
        if (score >= 80) return { bg: '#E8E4D4', text: '#8B8B5A' };
        return { bg: '#E8D8D4', text: '#8B6B5A' };
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
                    // Show success state (session history handled by parent)
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
        [product, isProcessing, loading, processPurchase, onPurchaseSuccess, error, reset]
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

    const getButtonStyle = () => {
        switch (buttonState) {
            case 'loading':
                return { background: '#B8C6E6', color: '#fff', cursor: 'wait' };
            case 'success':
                return { background: '#B8E6B8', color: '#4A7B4A' };
            case 'error':
                return { background: '#E8B8B8', color: '#8B4A4A' };
            default:
                return { background: 'linear-gradient(135deg, #B8C6E6 0%, #A8B5D5 100%)', color: '#fff' };
        }
    };

    const handleCardClick = (e) => {
        if (!e.target.closest('button')) {
            onViewDetails?.(product);
        }
    };

    const comp = getCompatibilityColor(product.compatibility);

    return (
        <div
            className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg"
            onClick={handleCardClick}
            style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid #E8D4DC',
                boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
            }}
        >
            <div className="h-48 overflow-hidden relative" style={{ background: '#F5F0F2' }}>
                {!imageError ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #F0E4E8 0%, #E8DCE0 100%)' }}
                    >
                        <div className="text-6xl">🧴</div>
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <span
                        className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{ background: comp.bg, color: comp.text }}
                    >
                        {product.compatibility}% Match
                    </span>
                </div>

                <h3 className="text-lg font-bold mb-1" style={{ color: '#8B4367' }}>{product.name}</h3>
                <p className="text-sm mb-3" style={{ color: '#A67B8B' }}>{product.brand}</p>

                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {product.benefits?.slice(0, 3).map((benefit, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 text-xs rounded-full"
                                style={{ background: '#F0E4E8', color: '#8B6B7B' }}
                            >
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold" style={{ color: '#8B4367' }}>{product.price}</span>
                    <span className="text-sm font-semibold" style={{ color: '#8B6B9B' }}>{product.solana} SOL</span>
                </div>

                <div className="flex gap-2">
                    <a
                        href={product.productUrl || product.brandUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`flex-1 py-2 rounded-xl font-semibold transition-colors text-center no-underline ${(isProcessing || loading) ? 'opacity-50 pointer-events-none' : ''}`}
                        style={{
                            background: 'linear-gradient(135deg, #D4A5B8 0%, #C495A8 100%)',
                            color: '#fff',
                        }}
                    >
                        Product Link
                    </a>
                    <button
                        onClick={handlePurchase}
                        disabled={isProcessing || loading || buttonState === 'success'}
                        className={`flex-1 py-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${buttonState === 'error' ? 'animate-shake' : ''}`}
                        style={getButtonStyle()}
                    >
                        {getButtonContent()}
                    </button>
                </div>
            </div>
        </div>
    );
}
