import { useState } from 'react';
import Head from 'next/head';
import products from '@/data/products';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import WalletConnectButton from '@/components/WalletConnectButton';
import NotificationContainer from '@/components/Notification';

export default function Products() {
    const [filter, setFilter] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [sessionPurchases, setSessionPurchases] = useState([]);

    const categories = [
        { id: 'all', name: 'All Products', icon: '✨' },
        { id: 'cleanser', name: 'Cleansers', icon: '🧴' },
        { id: 'serum', name: 'Serums', icon: '💧' },
        { id: 'moisturizer', name: 'Moisturizers', icon: '🧊' },
        { id: 'sunscreen', name: 'Sunscreen', icon: '☀️' }
    ];

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    // Handle purchase success - add to session-only state (no storage)
    const handlePurchaseSuccess = (result) => {
        if (selectedProduct) setSelectedProduct(null);

        const purchase = {
            id: Date.now(),
            productName: result.product.name,
            productBrand: result.product.brand,
            solanaAmount: result.product.solana,
            signature: result.signature,
            explorerUrl: result.explorerUrl,
            timestamp: new Date().toISOString(),
        };
        setSessionPurchases((prev) => [purchase, ...prev]);

        if (result.status === 'confirmed') {
            alert(`Purchase successful! Transaction: ${result.signature.substring(0, 8)}...`);
        } else {
            alert(`Transaction pending. Check your wallet or view on Explorer.`);
        }
    };

    return (
        <>
            <Head>
                <title>Solana Skincare Marketplace</title>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-100">
                {/* Notification Container */}
                <NotificationContainer position="top-right" />

                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Solana Skincare Marketplace</h1>
                        <WalletConnectButton />
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-8">
                    {/* Info Banner */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white mb-6">
                        <h2 className="text-2xl font-bold mb-2">Personalized for You</h2>
                        <p className="text-purple-100">
                            Based on your skin profile: Medium tone, Combination skin, 25-34 age range
                        </p>
                    </div>

                    {/* Category Filters */}
                    <div className="mb-6 overflow-x-auto">
                        <div className="flex gap-2 pb-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id)}
                                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                                        filter === cat.id
                                            ? 'bg-rose-600 text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="mr-2">{cat.icon}</span>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="product-grid grid gap-6 mb-8">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onPurchaseSuccess={handlePurchaseSuccess}
                                onViewDetails={setSelectedProduct}
                            />
                        ))}
                    </div>

                    {/* Session-only purchase history (clears on refresh) */}
                    {sessionPurchases.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Purchases</h2>
                            <p className="text-sm text-gray-500 mb-4">Session only — will clear on refresh</p>
                            <div className="space-y-3">
                                {sessionPurchases.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{p.productName}</h3>
                                            <p className="text-sm text-gray-600">{p.productBrand} · {p.solanaAmount} SOL</p>
                                            <p className="text-xs text-gray-400">{new Date(p.timestamp).toLocaleString()}</p>
                                        </div>
                                        <a
                                            href={p.explorerUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200"
                                        >
                                            View on Explorer
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Product Detail Modal */}
                    {selectedProduct && (
                        <ProductDetailModal
                            product={selectedProduct}
                            onClose={() => setSelectedProduct(null)}
                            onPurchaseSuccess={handlePurchaseSuccess}
                        />
                    )}
                </main>
            </div>
        </>
    );
}
