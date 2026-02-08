import { useState } from 'react';
import { usePayment } from '@/hooks/usePayment';

export default function ProductDetailModal({ product, onClose, onPurchaseSuccess }) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [imageError, setImageError] = useState(false);

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

    const handlePurchase = async () => {
        try {
            const result = await processPurchase(product);

            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    reset();
                    onClose();
                    if (onPurchaseSuccess) {
                        onPurchaseSuccess({
                            product,
                            signature: result.signature,
                            explorerUrl: result.explorerUrl,
                            status: result.confirmed ? 'confirmed' : 'pending',
                        });
                    }
                }, 3000);
            }
        } catch (err) {
            setShowError(true);
            setTimeout(() => {
                setShowError(false);
                reset();
            }, 5000);
        }
    };

    if (!product) return null;

    const comp = getCompatibilityColor(product.compatibility);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(139,67,103,0.15)' }}
        >
            <div
                className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                style={{
                    background: '#fefcfe',
                    border: '1px solid #E8D4DC',
                    boxShadow: '0 8px 32px rgba(212,165,184,0.2)',
                }}
            >
                <div
                    className="sticky top-0 p-6 flex items-center justify-between rounded-t-2xl"
                    style={{ background: '#fefcfe', borderBottom: '1px solid #E8D4DC' }}
                >
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors"
                        style={{ color: '#8B4367' }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Products
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: '#8B4367' }}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <div className="h-64 mb-6 rounded-xl overflow-hidden" style={{ background: '#F5F0F2' }}>
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
                                <div className="text-8xl">🧴</div>
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <span
                            className="px-3 py-1 rounded-full text-sm font-bold"
                            style={{ background: comp.bg, color: comp.text }}
                        >
                            {product.compatibility}% Match
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-2" style={{ color: '#8B4367' }}>{product.name}</h3>
                    <p className="text-xl mb-4" style={{ color: '#A67B8B' }}>{product.brand}</p>
                    <p className="mb-6" style={{ color: '#6B5B63' }}>{product.description}</p>
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2" style={{ color: '#8B4367' }}>Benefits:</h4>
                        <div className="flex flex-wrap gap-2">
                            {product.benefits?.map((benefit, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 text-sm rounded-full"
                                    style={{ background: '#F0E4E8', color: '#8B6B7B' }}
                                >
                                    {benefit}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2" style={{ color: '#8B4367' }}>Target Concerns:</h4>
                        <div className="flex flex-wrap gap-2">
                            {product.concerns?.map((concern, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 text-sm rounded-full"
                                    style={{ background: '#D4E8F0', color: '#5A8BA8' }}
                                >
                                    {concern}
                                </span>
                            ))}
                        </div>
                    </div>
                    {product.ingredients && (
                        <div className="mb-6">
                            <h4 className="font-semibold mb-2" style={{ color: '#8B4367' }}>Ingredients:</h4>
                            <p className="text-sm leading-relaxed" style={{ color: '#6B5B63' }}>
                                {product.ingredients.join(', ')}
                            </p>
                        </div>
                    )}
                    {product.brandUrl && (
                        <div className="mb-6">
                            <a
                                href={product.brandUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold"
                                style={{ color: '#8B6B9B' }}
                            >
                                Visit {product.brand} website →
                            </a>
                        </div>
                    )}

                    {/* Error Display */}
                    {showError && error && (
                        <div className="mb-4 p-3 rounded-xl" style={{ background: '#F8E8E8', border: '1px solid #E8C8C8' }}>
                            <p className="text-sm" style={{ color: '#8B4A4A' }}>{error.message}</p>
                        </div>
                    )}

                    {/* Success Feedback */}
                    {showSuccess && signature && (
                        <div className="mb-4 p-3 rounded-xl" style={{ background: '#E8F4E8', border: '1px solid #C8E0C8' }}>
                            <p className="text-sm" style={{ color: '#5A8B5A' }}>
                                {transactionStatus === 'pending'
                                    ? 'Transaction pending. Check your wallet.'
                                    : 'Purchase successful!'}
                            </p>
                            {signature && (
                                <a
                                    href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm underline mt-1 block"
                                    style={{ color: '#4A7B4A' }}
                                >
                                    View on Explorer
                                </a>
                            )}
                        </div>
                    )}

                    <div
                        className="flex items-center justify-between p-4 rounded-xl mb-6"
                        style={{ background: '#F5F0F2', border: '1px solid #E8DCE0' }}
                    >
                        <div>
                            <div className="text-sm" style={{ color: '#A67B8B' }}>Price</div>
                            <div className="text-2xl font-bold" style={{ color: '#8B4367' }}>{product.price}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm" style={{ color: '#A67B8B' }}>Solana</div>
                            <div className="text-2xl font-bold" style={{ color: '#8B6B9B' }}>{product.solana} SOL</div>
                        </div>
                    </div>
                    <button
                        onClick={handlePurchase}
                        disabled={loading || showSuccess}
                        className="w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: 'linear-gradient(135deg, #B8C6E6 0%, #A8B5D5 100%)',
                            color: '#fff',
                        }}
                    >
                        {loading
                            ? transactionStatus === 'pending'
                                ? 'Confirming...'
                                : 'Processing...'
                            : showSuccess
                                ? '✓ Success!'
                                : 'Purchase with SOL'}
                    </button>
                </div>
            </div>
        </div>
    );
}

