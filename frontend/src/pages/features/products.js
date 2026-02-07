import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Products() {
    const router = useRouter();
    const [filter, setFilter] = useState('all');

    const products = [
        {
            id: 1,
            name: 'Hydrating Cleanser',
            brand: 'CeraVe',
            category: 'cleanser',
            compatibility: 95,
            price: '$14.99',
            benefits: ['Gentle', 'Hydrating', 'Non-comedogenic'],
            concerns: ['Dry skin', 'Sensitive skin'],
            solana: 0.05
        },
        {
            id: 2,
            name: 'Niacinamide Serum',
            brand: 'The Ordinary',
            category: 'serum',
            compatibility: 88,
            price: '$5.90',
            benefits: ['Minimizes pores', 'Brightening', 'Oil control'],
            concerns: ['Large pores', 'Uneven tone'],
            solana: 0.02
        },
        {
            id: 3,
            name: 'Retinol Night Cream',
            brand: 'Neutrogena',
            category: 'moisturizer',
            compatibility: 82,
            price: '$18.99',
            benefits: ['Anti-aging', 'Smoothing', 'Firming'],
            concerns: ['Fine lines', 'Wrinkles'],
            solana: 0.06
        },
        {
            id: 4,
            name: 'Vitamin C Brightening',
            brand: 'TruSkin',
            category: 'serum',
            compatibility: 91,
            price: '$19.99',
            benefits: ['Brightening', 'Antioxidant', 'Even tone'],
            concerns: ['Dark spots', 'Dullness'],
            solana: 0.07
        },
        {
            id: 5,
            name: 'Hyaluronic Acid Gel',
            brand: 'Neutrogena',
            category: 'moisturizer',
            compatibility: 94,
            price: '$16.47',
            benefits: ['Deep hydration', 'Plumping', 'Lightweight'],
            concerns: ['Dehydration', 'Fine lines'],
            solana: 0.05
        },
        {
            id: 6,
            name: 'Mineral Sunscreen SPF 50',
            brand: 'La Roche-Posay',
            category: 'sunscreen',
            compatibility: 89,
            price: '$33.50',
            benefits: ['Broad spectrum', 'Reef safe', 'No white cast'],
            concerns: ['Sun protection', 'Sensitive skin'],
            solana: 0.10
        }
    ];

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

    const getCompatibilityColor = (score) => {
        if (score >= 90) return 'text-green-600 bg-green-50';
        if (score >= 80) return 'text-yellow-600 bg-yellow-50';
        return 'text-orange-600 bg-orange-50';
    };

    return (
        <>
            <Head>
                <title>Product Recommendations - SkinCare AI</title>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-100">
                {/* Header */}
                <header className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => router.push('/home')}
                                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
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
                                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === cat.id
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
                                {/* Product Image Placeholder */}
                                <div className="bg-gradient-to-br from-rose-100 to-purple-100 h-48 flex items-center justify-center">
                                    <div className="text-6xl">🧴</div>
                                </div>

                                <div className="p-6">
                                    {/* Compatibility Score */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCompatibilityColor(product.compatibility)}`}>
                                            {product.compatibility}% Match
                                        </span>
                                        <button className="p-2 hover:bg-gray-100 rounded-full">
                                            <svg className="w-5 h-5 text-gray-400 hover:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Product Info */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{product.brand}</p>

                                    {/* Benefits */}
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-1">
                                            {product.benefits.slice(0, 3).map((benefit, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-rose-50 text-rose-600 text-xs rounded-full">
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price and Solana */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                                        <div className="flex items-center text-purple-600">
                                            <span className="text-sm font-semibold">{product.solana} SOL</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-rose-600 text-white py-2 rounded-lg font-semibold hover:bg-rose-700 transition-colors">
                                            Add to Routine
                                        </button>
                                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AR Feature Teaser */}
                    <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Coming Soon: AR Try-On</h3>
                                <p className="text-indigo-100">See how products affect your skin before buying</p>
                            </div>
                            <div className="text-5xl">📱</div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}