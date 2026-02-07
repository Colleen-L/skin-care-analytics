import { useState } from 'react';
import Head from 'next/head';
import products from '@/data/products';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import PurchaseHistory from '@/components/PurchaseHistory';
import WalletConnectButton from '@/components/WalletConnectButton';
import NotificationContainer from '@/components/Notification';

export default function Products() {
    const [filter, setFilter] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);

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

    // Handle purchase success callback
    const handlePurchaseSuccess = (result) => {
        // Close modal if open
        if (selectedProduct) {
            setSelectedProduct(null);
        }

        // Show success message
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

                    {/* Purchase History */}
                    <PurchaseHistory />

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
