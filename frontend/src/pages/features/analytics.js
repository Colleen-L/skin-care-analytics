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
        return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
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
                            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                        </div>

                        {/* Time Range Selector */}
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-600 focus:outline-none"
                        >
                            <option value="7days">Last 7 days</option>
                            <option value="30days">Last 30 days</option>
                            <option value="90days">Last 90 days</option>
                            <option value="all">All time</option>
                        </select>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-8">
                    {/* Skin Progress Overview */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Skin Progress 📊</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(skinMetrics).map(([key, data]) => (
                                <div key={key} className="bg-white rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-gray-600 capitalize">{key}</h3>
                                        <span className={`text-2xl ${getChangeColor(data.change)}`}>
                                            {getChangeIcon(data.change)}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-3xl font-bold text-gray-900">{data.current}</p>
                                            <p className="text-sm text-gray-500">Score</p>
                                        </div>
                                        <div className={`text-right ${getChangeColor(data.change)}`}>
                                            <p className="text-lg font-bold">{data.change > 0 ? '+' : ''}{data.change}%</p>
                                            <p className="text-xs">vs last period</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-rose-400 to-pink-500 h-2 rounded-full transition-all"
                                            style={{ width: `${data.current}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Consistency Tracker */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Routine Consistency 🎯</h2>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <svg className="w-32 h-32">
                                            <circle
                                                className="text-gray-200"
                                                strokeWidth="8"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="56"
                                                cx="64"
                                                cy="64"
                                            />
                                            <circle
                                                className="text-rose-600"
                                                strokeWidth="8"
                                                strokeDasharray={2 * Math.PI * 56}
                                                strokeDashoffset={2 * Math.PI * 56 * (1 - consistencyData.percentage / 100)}
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="56"
                                                cx="64"
                                                cy="64"
                                                transform="rotate(-90 64 64)"
                                            />
                                        </svg>
                                        <span className="absolute text-3xl font-bold text-gray-900">
                                            {consistencyData.percentage}%
                                        </span>
                                    </div>
                                    <p className="text-gray-600 font-medium mt-2">Overall</p>
                                </div>

                                <div className="text-center">
                                    <div className="text-5xl font-bold text-rose-600">{consistencyData.streak}</div>
                                    <p className="text-gray-600 font-medium">Day Streak 🔥</p>
                                </div>

                                <div className="text-center">
                                    <div className="text-5xl font-bold text-green-600">{consistencyData.totalDays - consistencyData.missedDays}</div>
                                    <p className="text-gray-600 font-medium">Days Completed ✅</p>
                                </div>

                                <div className="text-center">
                                    <div className="text-5xl font-bold text-gray-400">{consistencyData.missedDays}</div>
                                    <p className="text-gray-600 font-medium">Days Missed</p>
                                </div>
                            </div>

                            {/* Token Incentive */}
                            <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">Tokens Earned This Month</p>
                                        <p className="text-2xl font-bold">87 🪙</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-purple-100">Keep your streak going!</p>
                                        <p className="text-sm text-purple-100">13 more for bonus reward</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Usage */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Usage 🧴</h2>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="space-y-4">
                                {productUsage.map((product) => (
                                    <div key={product.name}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-gray-900">{product.uses}/{consistencyData.totalDays}</span>
                                                <span className="text-sm text-gray-500 ml-2">({product.percentage}%)</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-rose-400 to-pink-500 h-3 rounded-full transition-all"
                                                style={{ width: `${product.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cycle Tracking */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cycle Impact Analysis 🌙</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {cycleTracking.map((phase) => (
                                <div key={phase.phase} className="bg-white rounded-xl p-6 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-2">{phase.phase} Phase</h3>
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">Skin Quality</span>
                                            <span className="text-sm font-bold text-gray-900">{phase.skinQuality}/100</span>
                                        </div>
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full"
                                                style={{ width: `${phase.skinQuality}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 italic">{phase.notes}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                        <h2 className="text-xl font-bold mb-4">✨ AI Insights</h2>
                        <div className="space-y-3">
                            <div className="bg-white/20 rounded-lg p-4">
                                <p className="font-semibold mb-1">🎉 Great Progress!</p>
                                <p className="text-sm text-blue-50">Your skin hydration improved by 15% this month. Keep up your morning routine!</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-4">
                                <p className="font-semibold mb-1">💡 Recommendation</p>
                                <p className="text-sm text-blue-50">Consider using your retinol more consistently during luteal phase to combat breakouts.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}