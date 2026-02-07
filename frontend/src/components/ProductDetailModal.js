import { useState } from 'react';
import { usePayment } from '@/hooks/usePayment';

export default function ProductDetailModal({ product, onClose, onPurchaseSuccess }) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <div className="h-64 bg-gray-100 mb-6 rounded-lg overflow-hidden">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-purple-100"><div class="text-8xl">🧴</div></div>';
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCompatibilityColor(product.compatibility)}`}>
                            {product.compatibility}% Match
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-xl text-gray-600 mb-4">{product.brand}</p>
                    <p className="text-gray-700 mb-6">{product.description}</p>
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                        <div className="flex flex-wrap gap-2">
                            {product.benefits?.map((benefit, idx) => (
                                <span key={idx} className="px-3 py-1 bg-rose-50 text-rose-600 text-sm rounded-full">
                                    {benefit}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Target Concerns:</h4>
                        <div className="flex flex-wrap gap-2">
                            {product.concerns?.map((concern, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                                    {concern}
                                </span>
                            ))}
                        </div>
                    </div>
                    {product.ingredients && (
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-2">Ingredients:</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
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
                                className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                            >
                                Visit {product.brand} website →
                            </a>
                        </div>
                    )}

                    {/* Error Display */}
                    {showError && error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error.message}</p>
                        </div>
                    )}

                    {/* Success Feedback */}
                    {showSuccess && signature && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-600">
                                {transactionStatus === 'pending'
                                    ? 'Transaction pending. Check your wallet.'
                                    : 'Purchase successful!'}
                            </p>
                            {signature && (
                                <a
                                    href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-700 underline mt-1 block"
                                >
                                    View on Explorer
                                </a>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                        <div>
                            <div className="text-sm text-gray-600">Price</div>
                            <div className="text-2xl font-bold text-gray-900">{product.price}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Solana</div>
                            <div className="text-2xl font-bold text-purple-600">{product.solana} SOL</div>
                        </div>
                    </div>
                    <button
                        onClick={handlePurchase}
                        disabled={loading || showSuccess}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

