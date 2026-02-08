import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Analytics() {
    const router = useRouter();
    const [timeRange, setTimeRange] = useState('30');
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [skinProgress, setSkinProgress] = useState(null);
    const [productEffectiveness, setProductEffectiveness] = useState(null);
    const [activeTooltip, setActiveTooltip] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        try {
            // Fetch overview data
            const overviewResponse = await fetch(
                `http://localhost:8000/skincare/analytics/overview?days=${timeRange}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            const overviewData = await overviewResponse.json();
            setAnalyticsData(overviewData);

            // Fetch skin progress data
            const progressResponse = await fetch(
                `http://localhost:8000/skincare/analytics/skin-progress?days=${timeRange}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            const progressData = await progressResponse.json();
            setSkinProgress(progressData);

            // Fetch product effectiveness
            const productResponse = await fetch(
                `http://localhost:8000/skincare/analytics/product-effectiveness?days=${timeRange}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            const productData = await productResponse.json();
            setProductEffectiveness(productData);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChangeColor = (change) => {
        if (change > 0) return { color: '#5A8B5A' };
        if (change < 0) return { color: '#8B4A4A' };
        return { color: '#A67B8B' };
    };

    const getChangeIcon = (change) => {
        if (change > 0) return '↗';
        if (change < 0) return '↘';
        return '→';
    };

    const InfoIcon = ({ tooltipId, content }) => (
        <div className="relative inline-block">
            <button
                onClick={() => setActiveTooltip(activeTooltip === tooltipId ? null : tooltipId)}
                className="ml-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-opacity hover:opacity-80"
                style={{
                    background: 'rgba(212, 165, 184, 0.3)',
                    color: '#8B4367',
                    border: '1px solid rgba(212, 165, 184, 0.5)',
                }}
            >
                ?
            </button>
            {activeTooltip === tooltipId && (
                <>
                    {/* Backdrop to close tooltip */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveTooltip(null)}
                    />
                    {/* Tooltip */}
                    <div
                        className="absolute z-50 p-4 rounded-lg shadow-lg text-sm left-0 top-8"
                        style={{
                            background: 'rgba(255, 255, 255, 0.85)',
                            border: '1px solid #E8D4DC',
                            color: '#8B4367',
                            backdropFilter: 'blur(8px)',
                            minWidth: '280px',
                            maxWidth: '400px',
                        }}
                    >
                        {content}
                        <div
                            className="absolute w-3 h-3 transform rotate-45 -top-1.5 left-4"
                            style={{
                                background: 'rgba(255, 255, 255, 0.85)',
                                border: '1px solid #E8D4DC',
                                borderRight: 'none',
                                borderBottom: 'none',
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );

    if (loading) {
        return (
            <>
                <Head>
                    <title>Analytics Dashboard - SkinCare AI</title>
                </Head>
                <div className="min-h-screen flex items-center justify-center" style={{ background: '#fef2f9' }}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#D4A5B8' }}></div>
                        <p style={{ color: '#8B4367' }}>Loading analytics...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!analyticsData) {
        return (
            <>
                <Head>
                    <title>Analytics Dashboard - SkinCare AI</title>
                </Head>
                <div className="min-h-screen flex items-center justify-center" style={{ background: '#fef2f9' }}>
                    <div className="text-center">
                        <p style={{ color: '#8B4367' }}>No data available</p>
                    </div>
                </div>
            </>
        );
    }

    const skinMetrics = skinProgress?.metrics || {};
    const consistencyData = analyticsData.consistency;
    const productUsage = analyticsData.product_usage || [];

    return (
        <>
            <Head>
                <title>Analytics Dashboard - SkinCare AI</title>
            </Head>

            <div className="min-h-screen" style={{ background: '#fef2f9' }}>
                {/* Header */}
                <header
                    className="sticky top-0 z-10 border-b"
                    style={{
                        background: 'rgba(255,255,255,0.9)',
                        borderColor: '#E8D4DC',
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/home')}
                                className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                                style={{
                                    background: '#F5E6DC',
                                    border: '2px solid #D4A5B8',
                                    color: '#8B4367',
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold" style={{ color: '#8B4367' }}>Analytics</h1>
                        </div>

                        {/* Time Range Selector */}
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 rounded-xl font-semibold"
                            style={{ border: '1px solid #E8D4DC', color: '#8B4367', background: 'rgba(255,255,255,0.9)' }}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">All time</option>
                        </select>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    {/* Consistency Tracker */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <h2 className="text-2xl font-bold" style={{ color: '#8B4367' }}>Routine Consistency 🎯</h2>
                            <InfoIcon
                                tooltipId="consistency-main"
                                content="Track how consistently you're logging your skincare routine. Regular tracking helps identify what works best for your skin!"
                            />
                        </div>
                        <div
                            className="rounded-xl p-6"
                            style={{
                                background: 'rgba(255,255,255,0.8)',
                                border: '1px solid #E8D4DC',
                                boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
                            }}
                        >
                            {/* Motivation Message */}
                            <div
                                className="rounded-xl p-4"
                                style={{
                                    background: 'linear-gradient(135deg, #D4A5B8 0%, #B8C6E6 100%)',
                                    border: '1px solid rgba(212,165,184,0.5)',
                                }}
                            >
                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <p className="font-semibold">
                                            {consistencyData.streak > 0 ? `${consistencyData.streak} day streak!` : 'Start your streak today!'}
                                        </p>
                                        <p className="text-sm opacity-90">
                                            {consistencyData.percentage >= 80 
                                                ? "Amazing consistency! Keep it up!" 
                                                : consistencyData.percentage >= 50 
                                                ? "Good progress! Try to log daily." 
                                                : "Start logging daily to see your skin improve!"}
                                        </p>
                                    </div>
                                    <div className="text-5xl">
                                        {consistencyData.streak > 7 ? '🔥' : consistencyData.streak > 0 ? '✨' : '💪'}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <svg className="w-32 h-32">
                                            <circle
                                                strokeWidth="8"
                                                stroke="#E8D4DC"
                                                fill="transparent"
                                                r="56"
                                                cx="64"
                                                cy="64"
                                            />
                                            <circle
                                                strokeWidth="8"
                                                strokeDasharray={2 * Math.PI * 56}
                                                strokeDashoffset={2 * Math.PI * 56 * (1 - consistencyData.percentage / 100)}
                                                strokeLinecap="round"
                                                stroke="#D4A5B8"
                                                fill="transparent"
                                                r="56"
                                                cx="64"
                                                cy="64"
                                                transform="rotate(-90 64 64)"
                                            />
                                        </svg>
                                        <span className="absolute text-3xl font-bold" style={{ color: '#8B4367' }}>
                                            {consistencyData.percentage}%
                                        </span>
                                    </div>
                                    <p className="font-medium mt-2" style={{ color: '#A67B8B' }}>Overall</p>
                                </div>

                                <div className="text-center flex flex-col justify-center">
                                    <div className="text-5xl font-bold" style={{ color: '#D4A5B8' }}>{consistencyData.streak}</div>
                                    <p className="font-medium mt-2" style={{ color: '#A67B8B' }}>Day Streak 🔥</p>
                                </div>

                                <div className="text-center flex flex-col justify-center">
                                    <div className="text-5xl font-bold" style={{ color: '#5A8B5A' }}>{consistencyData.completed_days}</div>
                                    <p className="font-medium mt-2" style={{ color: '#A67B8B' }}>Days Completed ✅</p>
                                </div>

                                <div className="text-center flex flex-col justify-center">
                                    {analyticsData.skin_trends.most_common_condition ? (
                                        <>
                                            <div className="text-3xl font-bold" style={{ color: '#B8C6E6' }}>
                                                {analyticsData.skin_trends.most_common_condition}
                                            </div>
                                            <p className="font-medium mt-2" style={{ color: '#A67B8B' }}>Most Common Condition</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-5xl font-bold" style={{ color: '#C4A8B4' }}>{consistencyData.missed_days}</div>
                                            <p className="font-medium mt-2" style={{ color: '#A67B8B' }}>Days Missed</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skin Progress Overview */}
                    {Object.keys(skinMetrics).length > 0 ? (
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <h2 className="text-2xl font-bold" style={{ color: '#8B4367' }}>Skin Progress 📊</h2>
                                <InfoIcon
                                    tooltipId="skin-progress-main"
                                    content="Tracks specific skin concerns over time based on AI analysis of your photos. Compares first half vs. second half of your time period to detect trends. Higher scores = better skin!"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {Object.entries(skinMetrics).map(([key, data]) => (
                                    <div
                                        key={key}
                                        className="rounded-xl p-6"
                                        style={{
                                            background: 'rgba(255,255,255,0.8)',
                                            border: '1px solid #E8D4DC',
                                            boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <h3 className="capitalize" style={{ color: '#A67B8B' }}>
                                                    {key.replace('_', ' ')}
                                                </h3>
                                                <InfoIcon
                                                    tooltipId={`metric-${key}`}
                                                    content={
                                                        key === 'acne' ? 'Tracks breakouts, pimples, and blemishes detected in your photos.' :
                                                        key === 'dark_circles' ? 'Monitors under-eye darkness and discoloration.' :
                                                        key === 'wrinkles' ? 'Detects fine lines, wrinkles, and crow\'s feet.' :
                                                        key === 'spots' ? 'Tracks pigmentation, dark spots, and hyperpigmentation.' :
                                                        key === 'pores' ? 'Monitors enlarged or visible pores.' :
                                                        'AI-detected skin concern tracked over time.'
                                                    }
                                                />
                                            </div>
                                            <span className="text-2xl" style={getChangeColor(data.change)}>
                                                {getChangeIcon(data.change)}
                                            </span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-3xl font-bold" style={{ color: '#8B4367' }}>{data.current}</p>
                                                <p className="text-sm" style={{ color: '#A67B8B' }}>Score</p>
                                            </div>
                                            <div className="text-right" style={getChangeColor(data.change)}>
                                                <p className="text-lg font-bold">{data.change > 0 ? '+' : ''}{data.change}%</p>
                                                <p className="text-xs">vs last period</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 rounded-full h-2" style={{ background: '#F0E4E8' }}>
                                            <div
                                                className="h-2 rounded-full transition-all"
                                                style={{ width: `${data.current}%`, background: 'linear-gradient(90deg, #D4A5B8 0%, #B8C6E6 100%)' }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8">
                            <div
                                className="rounded-xl p-8 text-center"
                                style={{
                                    background: 'rgba(255,255,255,0.8)',
                                    border: '1px solid #E8D4DC',
                                    boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
                                }}
                            >
                                <p className="text-lg mb-2" style={{ color: '#8B4367' }}>📊 Skin Progress Tracking</p>
                                <p style={{ color: '#A67B8B' }}>
                                    Take photos with AI analysis to track your skin progress over time!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Product Usage */}
                    {productUsage.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <h2 className="text-2xl font-bold" style={{ color: '#8B4367' }}>Product Usage 🧴</h2>
                                <InfoIcon
                                    tooltipId="product-usage-main"
                                    content="Shows which products you've used most frequently and how consistently you're using them. Helps track your routine adherence!"
                                />
                            </div>
                            <div
                                className="rounded-xl p-6"
                                style={{
                                    background: 'rgba(255,255,255,0.8)',
                                    border: '1px solid #E8D4DC',
                                    boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
                                }}
                            >
                                <div className="space-y-4">
                                    {productUsage.map((product) => (
                                        <div key={product.name}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium" style={{ color: '#8B4367' }}>{product.name}</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold" style={{ color: '#8B4367' }}>
                                                        {product.uses}/{consistencyData.total_days}
                                                    </span>
                                                    <span className="text-sm ml-2" style={{ color: '#A67B8B' }}>
                                                        ({product.percentage}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="rounded-full h-3" style={{ background: '#F0E4E8' }}>
                                                <div
                                                    className="h-3 rounded-full transition-all"
                                                    style={{ 
                                                        width: `${product.percentage}%`, 
                                                        background: 'linear-gradient(90deg, #D4A5B8 0%, #B8C6E6 100%)' 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Effectiveness */}
                    {productEffectiveness?.products && productEffectiveness.products.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <h2 className="text-2xl font-bold" style={{ color: '#8B4367' }}>Product Effectiveness 💫</h2>
                                <InfoIcon
                                    tooltipId="product-effectiveness-main"
                                    content="Correlates products with your skin condition outcomes. Skin scores range from 0-100 (Clear=100, Normal=90, Combination=70, Dry/Oily=60, Sensitive=50, Acne=30). Higher scores indicate better results when using that product!"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {productEffectiveness.products.slice(0, 6).map((product) => (
                                    <div
                                        key={product.product_name}
                                        className="rounded-xl p-6"
                                        style={{
                                            background: 'rgba(255,255,255,0.8)',
                                            border: '1px solid #E8D4DC',
                                            boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
                                        }}
                                    >
                                        <h3 className="font-bold mb-2" style={{ color: '#8B4367' }}>{product.product_name}</h3>
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center">
                                                    <span className="text-sm" style={{ color: '#A67B8B' }}>Skin Score</span>
                                                    <InfoIcon
                                                        tooltipId={`product-score-${product.product_name}`}
                                                        content="Average skin quality score when using this product. Higher scores mean better skin outcomes!"
                                                    />
                                                </div>
                                                <span className="text-sm font-bold" style={{ color: '#8B4367' }}>
                                                    {product.average_skin_score}/100
                                                </span>
                                            </div>
                                            <div className="rounded-full h-2" style={{ background: '#F0E4E8' }}>
                                                <div
                                                    className="h-2 rounded-full"
                                                    style={{ 
                                                        width: `${product.average_skin_score}%`, 
                                                        background: 'linear-gradient(90deg, #D4A5B8 0%, #B8C6E6 100%)' 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm" style={{ color: '#A67B8B' }}>
                                            Used {product.uses} times
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: '#A67B8B' }}>
                                            Most common skin type when used: {product.most_common_condition}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </>
    );
}