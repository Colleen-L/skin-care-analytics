import { useState, useMemo } from 'react';
import { usePurchaseHistory } from '@/hooks/useLocalStorage';
import { getExplorerUrl, openInExplorer, getPreferredExplorer } from '@/utils/explorerUtils';
import products from '@/data/products';

export default function PurchaseHistory() {
    const [purchases, refreshPurchases, loading] = usePurchaseHistory();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExplorer, setSelectedExplorer] = useState(getPreferredExplorer());

    // Map purchases to product details
    const purchasesWithDetails = useMemo(() => {
        return purchases.map(purchase => {
            const product = products.find(p => p.id === purchase.productId || p.id === String(purchase.productId));
            return {
                ...purchase,
                product: product || null,
                productImage: product?.image || null,
            };
        });
    }, [purchases]);

    // Filter purchases by search query
    const filteredPurchases = useMemo(() => {
        if (!searchQuery.trim()) {
            return purchasesWithDetails;
        }

        const query = searchQuery.toLowerCase();
        return purchasesWithDetails.filter(purchase => {
            return (
                purchase.productName?.toLowerCase().includes(query) ||
                purchase.productBrand?.toLowerCase().includes(query) ||
                purchase.signature?.toLowerCase().includes(query) ||
                purchase.walletAddress?.toLowerCase().includes(query)
            );
        });
    }, [purchasesWithDetails, searchQuery]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch {
            return 'Invalid date';
        }
    };

    const truncateSignature = (signature) => {
        if (!signature) return 'N/A';
        return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
    };

    const truncateAddress = (address) => {
        if (!address || address === 'unknown') return 'Unknown';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const handleExplorerClick = (signature) => {
        openInExplorer(signature, 'devnet', selectedExplorer);
    };

    // Loading state
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Purchase History</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    // Empty state
    if (purchases.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Purchase History</h2>
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛍️</div>
                    <p className="text-gray-600 text-lg">No purchases yet</p>
                    <p className="text-gray-500 text-sm mt-2">Your purchase history will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Purchase History</h2>
                
                {/* Search/Filter */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search purchases..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* No results from search */}
            {filteredPurchases.length === 0 && searchQuery && (
                <div className="text-center py-8">
                    <p className="text-gray-600">No purchases found matching "{searchQuery}"</p>
                </div>
            )}

            {/* Purchase List - Desktop Card Layout */}
            <div className="hidden md:block space-y-4">
                {filteredPurchases.map((purchase) => (
                    <div
                        key={purchase.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                                {purchase.productImage ? (
                                    <img
                                        src={purchase.productImage}
                                        alt={purchase.productName}
                                        className="w-20 h-20 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-20 h-20 bg-gradient-to-br from-rose-100 to-purple-100 rounded-lg flex items-center justify-center text-3xl"
                                    style={{ display: purchase.productImage ? 'none' : 'flex' }}
                                >
                                    🧴
                                </div>
                            </div>

                            {/* Purchase Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                            {purchase.productName}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">{purchase.productBrand}</p>
                                        
                                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                            <span>{formatDate(purchase.timestamp)}</span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                {purchase.status || 'confirmed'}
                                            </span>
                                            <span>Wallet: {truncateAddress(purchase.walletAddress)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-semibold text-purple-600 text-lg">
                                                {purchase.price || purchase.solanaAmount || 0} SOL
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 font-mono">
                                                {truncateSignature(purchase.signature)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleExplorerClick(purchase.signature)}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors whitespace-nowrap"
                                        >
                                            View on Explorer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Purchase List - Mobile Layout */}
            <div className="md:hidden space-y-4">
                {filteredPurchases.map((purchase) => (
                    <div
                        key={purchase.id}
                        className="border border-gray-200 rounded-lg p-4"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                                {purchase.productImage ? (
                                    <img
                                        src={purchase.productImage}
                                        alt={purchase.productName}
                                        className="w-16 h-16 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-16 h-16 bg-gradient-to-br from-rose-100 to-purple-100 rounded-lg flex items-center justify-center text-2xl"
                                    style={{ display: purchase.productImage ? 'none' : 'flex' }}
                                >
                                    🧴
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {purchase.productName}
                                </h3>
                                <p className="text-sm text-gray-600">{purchase.productBrand}</p>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                                <div className="font-semibold text-purple-600">
                                    {purchase.price || purchase.solanaAmount || 0} SOL
                                </div>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-2 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatDate(purchase.timestamp)}</span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    {purchase.status || 'confirmed'}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500">
                                Wallet: {truncateAddress(purchase.walletAddress)}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                                TX: {truncateSignature(purchase.signature)}
                            </div>
                            <button
                                onClick={() => handleExplorerClick(purchase.signature)}
                                className="w-full mt-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors"
                            >
                                View on Explorer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
