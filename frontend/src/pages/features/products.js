import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import products from '@/data/products';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import WalletConnectButton from '@/components/WalletConnectButton';
import NotificationContainer from '@/components/Notification';

export default function Products() {
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [sessionPurchases, setSessionPurchases] = useState([]);
    const [profileSummary, setProfileSummary] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState(null);

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

    useEffect(() => {
        try {
            const profile = localStorage.getItem('skinProfile');
            if (profile) {
                const p = JSON.parse(profile);
                const parts = [];
                if (p.skinDescription) {
                    const name = p.skinDescription.replace(/^\w/, (c) => c.toUpperCase());
                    parts.push(name);
                }
                if (p.age) parts.push(`${p.age} yrs`);
                setProfileSummary(parts.length ? parts.join(', ') : 'Personalized');
                if (p.profileImageUrl) setProfileImageUrl(p.profileImageUrl);
            } else {
                setProfileSummary('Personalized');
            }
        } catch (_) {
            setProfileSummary('Personalized');
        }
    }, []);

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

            <div
                className="min-h-screen"
                style={{ background: 'linear-gradient(135deg, #fef6fa 0%, #ffffff 50%, #fef6fa 100%)' }}
            >
                {/* Notification Container */}
                <NotificationContainer position="top-right" />

                {/* Header - Wireframe style: back btn | profile pic + Based on profile | wallet (right) */}
                <header
                    className="sticky top-0 z-10 border-b"
                    style={{
                        background: 'rgba(255,255,255,0.9)',
                        borderColor: '#E8D4DC',
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center gap-6">
                        {/* Left: Back button (circular) */}
                        <button
                            onClick={() => router.push('/home')}
                            className="flex-shrink-0 w-[44px] h-[44px] rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                            style={{
                                background: '#F5E6DC',
                                border: '2px solid #D4A5B8',
                                color: '#8B4367',
                            }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>

                        {/* Center: Profile picture placeholder + "Based on profile" */}
                        <div className="flex-1 flex items-center gap-5 min-w-0">
                            <div
                                className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-cover bg-center"
                                style={{
                                    background: profileImageUrl ? `url(${profileImageUrl})` : '#F5E6DC',
                                    border: '2px solid #D4A5B8',
                                    color: profileImageUrl ? 'transparent' : '#D4A5B8',
                                }}
                            >
                                {!profileImageUrl && (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg font-semibold truncate" style={{ color: '#8B4367' }}>
                                    Based on profile
                                </p>
                                <p className="text-base truncate" style={{ color: '#A67B8B' }}>
                                    {profileSummary}
                                </p>
                            </div>
                        </div>

                        {/* Right: Wallet connect */}
                        <div className="flex-shrink-0">
                            <WalletConnectButton size="lg" />
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

                    {/* Category Filters */}
                    <div className="mb-6 overflow-x-auto">
                        <div className="flex gap-2 pb-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id)}
                                    className={`px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                                        filter === cat.id
                                            ? 'text-white shadow-sm'
                                            : 'bg-white/80 hover:bg-white'
                                    }`}
                                    style={
                                        filter === cat.id
                                            ? { background: 'linear-gradient(135deg, #D4A5B8 0%, #C495A8 100%)' }
                                            : { color: '#8B4367', border: '1px solid #E8D4DC' }
                                    }
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
                        <div
                            className="rounded-xl p-6 mb-8"
                            style={{
                                background: 'rgba(255,255,255,0.8)',
                                border: '1px solid #E8D4DC',
                                boxShadow: '0 2px 12px rgba(212,165,184,0.15)',
                            }}
                        >
                            <h2 className="text-xl font-bold mb-2" style={{ color: '#8B4367' }}>Recent Purchases</h2>
                            <p className="text-sm mb-4" style={{ color: '#A67B8B' }}>Session only — will clear on refresh</p>
                            <div className="space-y-3">
                                {sessionPurchases.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between py-3 border-b last:border-0"
                                        style={{ borderColor: '#F0E4E8' }}
                                    >
                                        <div>
                                            <h3 className="font-semibold" style={{ color: '#8B4367' }}>{p.productName}</h3>
                                            <p className="text-sm" style={{ color: '#A67B8B' }}>{p.productBrand} · {p.solanaAmount} SOL</p>
                                            <p className="text-xs" style={{ color: '#C4A8B4' }}>{new Date(p.timestamp).toLocaleString()}</p>
                                        </div>
                                        <a
                                            href={p.explorerUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                                            style={{
                                                background: '#D4E8F0',
                                                color: '#5A8BA8',
                                            }}
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
