import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState } from 'react';

export default function Analytics() {
    const router = useRouter();
    const [timeRange, setTimeRange] = useState('30days');

    // Mock analytics data
    const skinMetrics = {
        acne: { current: 12, change: -18, trend: 'improving' },
        oiliness: { current: 45, change: -8, trend: 'improving' },
        hydration: { current: 72, change: +15, trend: 'improving' },
        glow: { current: 68, change: +22, trend: 'improving' }
    };

    const consistencyData = {
        percentage: 87,
        streak: 14,
        totalDays: 30,
        missedDays: 4
    };

    const productUsage = [
        { name: 'Cleanser', uses: 28, percentage: 93 },
        { name: 'Vitamin C Serum', uses: 25, percentage: 83 },
        { name: 'Moisturizer', uses: 29, percentage: 97 },
        { name: 'Sunscreen', uses: 27, percentage: 90 },
        { name: 'Retinol', uses: 22, percentage: 73 }
    ];

    const cycleTracking = [
        { phase: 'Follicular', skinQuality: 85, notes: 'Clear, glowing skin' },
        { phase: 'Ovulation', skinQuality: 92, notes: 'Best skin of the month' },
        { phase: 'Luteal', skinQuality: 68, notes: 'Some breakouts, oily T-zone' },
        { phase: 'Menstrual', skinQuality: 71, notes: 'Sensitivity, dryness' }
    ];

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

    return (
        <>
            <Head>
                <title>Analytics Dashboard - SkinCare AI</title>
            </Head>

            <div className="min-h-screen" style={{ background: '#fef2f9' }}>
                {/* Header - Match products page style */}
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
                            <option value="7days">Last 7 days</option>
                            <option value="30days">Last 30 days</option>
                            <option value="90days">Last 90 days</option>
                            <option value="all">All time</option>
                        </select>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    {/* Skin Progress Overview */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4" style={{ color: '#8B4367' }}>Skin Progress 📊</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                        <h3 className="capitalize" style={{ color: '#A67B8B' }}>{key}</h3>
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

                    {/* Consistency Tracker */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4" style={{ color: '#8B4367' }}>Routine Consistency 🎯</h2>
                        <div
                            className="rounded-xl p-6"
                            style={{
                                background: 'rgba(255,255,255,0.8)',
                                border: '1px solid #E8D4DC',
                                boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

                                <div className="text-center">
                                    <div className="text-5xl font-bold" style={{ color: '#D4A5B8' }}>{consistencyData.streak}</div>
                                    <p className="font-medium" style={{ color: '#A67B8B' }}>Day Streak 🔥</p>
                                </div>

                                <div className="text-center">
                                    <div className="text-5xl font-bold" style={{ color: '#5A8B5A' }}>{consistencyData.totalDays - consistencyData.missedDays}</div>
                                    <p className="font-medium" style={{ color: '#A67B8B' }}>Days Completed ✅</p>
                                </div>

                                <div className="text-center">
                                    <div className="text-5xl font-bold" style={{ color: '#C4A8B4' }}>{consistencyData.missedDays}</div>
                                    <p className="font-medium" style={{ color: '#A67B8B' }}>Days Missed</p>
                                </div>
                            </div>

                            {/* Token Incentive */}
                            <div
                                className="mt-6 rounded-xl p-4"
                                style={{
                                    background: 'linear-gradient(135deg, #D4A5B8 0%, #B8C6E6 100%)',
                                    border: '1px solid rgba(212,165,184,0.5)',
                                }}
                            >
                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <p className="font-semibold">Tokens Earned This Month</p>
                                        <p className="text-2xl font-bold">87 🪙</p>
                                    </div>
                                    <div className="text-right opacity-90">
                                        <p className="text-sm">Keep your streak going!</p>
                                        <p className="text-sm">13 more for bonus reward</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Usage */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4" style={{ color: '#8B4367' }}>Product Usage 🧴</h2>
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
                                                <span className="text-sm font-bold" style={{ color: '#8B4367' }}>{product.uses}/{consistencyData.totalDays}</span>
                                                <span className="text-sm ml-2" style={{ color: '#A67B8B' }}>({product.percentage}%)</span>
                                            </div>
                                        </div>
                                        <div className="rounded-full h-3" style={{ background: '#F0E4E8' }}>
                                            <div
                                                className="h-3 rounded-full transition-all"
                                                style={{ width: `${product.percentage}%`, background: 'linear-gradient(90deg, #D4A5B8 0%, #B8C6E6 100%)' }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cycle Tracking */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4" style={{ color: '#8B4367' }}>Cycle Impact Analysis 🌙</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {cycleTracking.map((phase) => (
                                <div
                                    key={phase.phase}
                                    className="rounded-xl p-6"
                                    style={{
                                        background: 'rgba(255,255,255,0.8)',
                                        border: '1px solid #E8D4DC',
                                        boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
                                    }}
                                >
                                    <h3 className="font-bold mb-2" style={{ color: '#8B4367' }}>{phase.phase} Phase</h3>
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm" style={{ color: '#A67B8B' }}>Skin Quality</span>
                                            <span className="text-sm font-bold" style={{ color: '#8B4367' }}>{phase.skinQuality}/100</span>
                                        </div>
                                        <div className="rounded-full h-2" style={{ background: '#F0E4E8' }}>
                                            <div
                                                className="h-2 rounded-full"
                                                style={{ width: `${phase.skinQuality}%`, background: 'linear-gradient(90deg, #D4A5B8 0%, #B8C6E6 100%)' }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-sm italic" style={{ color: '#A67B8B' }}>{phase.notes}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insights */}
                    <div
                        className="rounded-xl p-6"
                        style={{
                            background: 'linear-gradient(135deg, #D4A5B8 0%, #B8C6E6 100%)',
                            border: '1px solid rgba(212,165,184,0.5)',
                        }}
                    >
                        <h2 className="text-xl font-bold mb-4 text-white">✨ AI Insights</h2>
                        <div className="space-y-3">
                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.3)' }}>
                                <p className="font-semibold mb-1 text-white">🎉 Great Progress!</p>
                                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.95)' }}>Your skin hydration improved by 15% this month. Keep up your morning routine!</p>
                            </div>
                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.3)' }}>
                                <p className="font-semibold mb-1 text-white">💡 Recommendation</p>
                                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.95)' }}>Consider using your retinol more consistently during luteal phase to combat breakouts.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}