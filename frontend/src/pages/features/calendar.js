import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Calendar() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCamera, setShowCamera] = useState(false);

    // Mock calendar data
    const calendarData = {
        '2024-02-01': { completed: true, score: 85, products: 5, photo: true },
        '2024-02-02': { completed: true, score: 82, products: 5, photo: true },
        '2024-02-03': { completed: true, score: 88, products: 4, photo: false },
        '2024-02-04': { completed: false, score: null, products: 0, photo: false },
        '2024-02-05': { completed: true, score: 90, products: 5, photo: true },
        '2024-02-06': { completed: true, score: 87, products: 5, photo: true },
        '2024-02-07': { completed: true, score: 89, products: 5, photo: true }
    };

    const selectedEntry = selectedDate ? calendarData[selectedDate] : null;

    const mockAnalysis = {
        acne: { score: 15, status: 'Low' },
        oiliness: { score: 42, status: 'Moderate' },
        hydration: { score: 75, status: 'Good' },
        redness: { score: 8, status: 'Minimal' },
        overall: 89,
        insights: [
            'Skin looks well-hydrated',
            'Minimal breakouts detected',
            'T-zone showing slight oiliness',
            'Continue current routine'
        ]
    };

    const mockProducts = [
        { name: 'Gentle Cleanser', time: '7:30 AM', category: 'cleanser' },
        { name: 'Vitamin C Serum', time: '7:32 AM', category: 'serum' },
        { name: 'Moisturizer', time: '7:35 AM', category: 'moisturizer' },
        { name: 'Sunscreen SPF 50', time: '7:37 AM', category: 'sunscreen' },
        { name: 'Retinol Cream', time: '10:15 PM', category: 'treatment' }
    ];

    const getDayStatus = (dateStr) => {
        const data = calendarData[dateStr];
        if (!data) return 'bg-gray-100 text-gray-400';
        if (data.completed && data.score >= 85) return 'bg-green-100 text-green-800 border-2 border-green-400';
        if (data.completed) return 'bg-blue-100 text-blue-800 border-2 border-blue-400';
        return 'bg-red-100 text-red-800 border-2 border-red-400';
    };

    const handleScan = () => {
        setShowCamera(true);
        // Simulate camera opening
        setTimeout(() => {
            setShowCamera(false);
            alert('Scan complete! Analysis saved.');
        }, 2000);
    };

    return (
        <>
            <Head>
                <title>Calendar & Tracker - SkinCare AI</title>
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
                            <h1 className="text-2xl font-bold text-gray-900">Tracker</h1>
                        </div>

                        <button
                            onClick={handleScan}
                            className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Scan Face
                        </button>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Calendar */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">February 2024</h2>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-2">
                                    {/* Day headers */}
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                                            {day}
                                        </div>
                                    ))}

                                    {/* Calendar days */}
                                    {Array.from({ length: 35 }, (_, i) => {
                                        const day = i - 2; // Start from day 1
                                        const dateStr = day > 0 && day <= 29 ? `2024-02-${String(day).padStart(2, '0')}` : null;
                                        const data = dateStr ? calendarData[dateStr] : null;

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => dateStr && setSelectedDate(dateStr)}
                                                disabled={!dateStr || day > 7}
                                                className={`aspect-square rounded-lg p-2 text-center transition-all ${dateStr && day <= 7 ? getDayStatus(dateStr) : 'bg-gray-50 text-gray-300'
                                                    } ${selectedDate === dateStr ? 'ring-2 ring-rose-600 ring-offset-2' : ''} disabled:cursor-not-allowed hover:shadow-md`}
                                            >
                                                {day > 0 && day <= 29 && (
                                                    <>
                                                        <div className="font-bold text-lg">{day}</div>
                                                        {data?.photo && (
                                                            <div className="text-xs mt-1">📸</div>
                                                        )}
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
                                        <span className="text-gray-600">Great (85+)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
                                        <span className="text-gray-600">Good</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></div>
                                        <span className="text-gray-600">Missed</span>
                                    </div>
                                </div>
                            </div>

                            {/* Smart Reminders */}
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                                <h3 className="text-xl font-bold mb-2">🔔 Smart Reminders</h3>
                                <p className="text-purple-100 mb-4">Get notified when it's time for your routine</p>
                                <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50">
                                    Set Reminders
                                </button>
                            </div>
                        </div>

                        {/* Day Details */}
                        <div className="lg:col-span-1">
                            {selectedEntry ? (
                                <div className="space-y-4">
                                    {/* Overall Score */}
                                    <div className="bg-white rounded-xl p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                                            {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </h3>

                                        <div className="text-center mb-4">
                                            <div className="text-5xl font-bold text-gray-900 mb-2">
                                                {selectedEntry.score}
                                            </div>
                                            <p className="text-gray-600">Overall Score</p>
                                        </div>

                                        {/* Face Photo */}
                                        {selectedEntry.photo && (
                                            <div className="bg-gradient-to-br from-rose-100 to-purple-100 rounded-lg h-48 flex items-center justify-center mb-4">
                                                <div className="text-6xl">😊</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Analysis */}
                                    <div className="bg-white rounded-xl p-6 shadow-sm">
                                        <h4 className="font-bold text-gray-900 mb-4">Skin Analysis</h4>
                                        <div className="space-y-3">
                                            {Object.entries(mockAnalysis).filter(([key]) => key !== 'overall' && key !== 'insights').map(([key, value]) => (
                                                <div key={key}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-gray-600 capitalize">{key}</span>
                                                        <span className="text-sm font-bold text-gray-900">{value.status}</span>
                                                    </div>
                                                    <div className="bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-rose-400 to-pink-500 h-2 rounded-full"
                                                            style={{ width: `${value.score}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                            <h5 className="font-semibold text-blue-900 mb-2">Key Insights</h5>
                                            <ul className="space-y-1">
                                                {mockAnalysis.insights.map((insight, idx) => (
                                                    <li key={idx} className="text-sm text-blue-800">• {insight}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Products Used */}
                                    <div className="bg-white rounded-xl p-6 shadow-sm">
                                        <h4 className="font-bold text-gray-900 mb-4">Products Used</h4>
                                        <div className="space-y-3">
                                            {mockProducts.map((product, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                                                        <p className="text-xs text-gray-600">{product.time}</p>
                                                    </div>
                                                    <span className="text-xl">✓</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                                    <div className="text-6xl mb-4">📅</div>
                                    <p className="text-gray-600">Select a day to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Camera Modal */}
                {showCamera && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📸</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Scanning...</h3>
                                <p className="text-gray-600">Analyzing your skin</p>
                                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-rose-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}