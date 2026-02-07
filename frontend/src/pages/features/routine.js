import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Routine() {
    const router = useRouter();
    const [activeRoutine, setActiveRoutine] = useState('am');
    const [scanData, setScanData] = useState(null);

    // Mock routine data based on skin analysis
    const routines = {
        am: [
            { id: 1, step: 'Cleanser', product: 'Gentle Foam Cleanser', area: 'Full face', time: '30 sec' },
            { id: 2, step: 'Toner', product: 'Hydrating Toner', area: 'Full face', time: '10 sec' },
            { id: 3, step: 'Serum', product: 'Vitamin C Serum', area: 'Cheeks & forehead', time: '20 sec' },
            { id: 4, step: 'Moisturizer', product: 'Light Day Cream', area: 'Full face', time: '30 sec' },
            { id: 5, step: 'Sunscreen', product: 'SPF 50+ Sunscreen', area: 'Full face & neck', time: '30 sec' }
        ],
        pm: [
            { id: 1, step: 'Oil Cleanser', product: 'Cleansing Oil', area: 'Full face', time: '60 sec' },
            { id: 2, step: 'Cleanser', product: 'Gentle Foam Cleanser', area: 'Full face', time: '30 sec' },
            { id: 3, step: 'Toner', product: 'Hydrating Toner', area: 'Full face', time: '10 sec' },
            { id: 4, step: 'Treatment', product: 'Retinol Serum', area: 'Avoid eye area', time: '20 sec' },
            { id: 5, step: 'Eye Cream', product: 'Peptide Eye Cream', area: 'Under eyes', time: '10 sec' },
            { id: 6, step: 'Moisturizer', product: 'Night Repair Cream', area: 'Full face', time: '30 sec' }
        ]
    };

    const handleScan = () => {
        // Simulate skin scan
        setScanData({
            concerns: ['Dark circles', 'Dry patches on cheeks', 'Oily T-zone'],
            recommendations: ['Focus on hydration', 'Use gentle exfoliation', 'Apply eye cream']
        });
    };

    const currentRoutine = routines[activeRoutine];

    return (
        <>
            <Head>
                <title>Routine Builder - SkinCare AI</title>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-100">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
                        <button
                            onClick={() => router.push('/home')}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Routine Builder</h1>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 py-8">
                    {/* Scan Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Skin Analysis</h2>
                                <p className="text-gray-600 text-sm">Based on your latest scan</p>
                            </div>
                            <button
                                onClick={handleScan}
                                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700"
                            >
                                New Scan
                            </button>
                        </div>

                        {scanData && (
                            <div className="bg-rose-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Key Findings:</h3>
                                <ul className="space-y-1">
                                    {scanData.concerns.map((concern, idx) => (
                                        <li key={idx} className="text-sm text-gray-700">• {concern}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* AM/PM Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white rounded-xl p-1 shadow-sm inline-flex">
                            <button
                                onClick={() => setActiveRoutine('am')}
                                className={`px-8 py-2 rounded-lg font-semibold transition-all ${activeRoutine === 'am'
                                        ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                🌅 AM Routine
                            </button>
                            <button
                                onClick={() => setActiveRoutine('pm')}
                                className={`px-8 py-2 rounded-lg font-semibold transition-all ${activeRoutine === 'pm'
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                🌙 PM Routine
                            </button>
                        </div>
                    </div>

                    {/* Routine Steps */}
                    <div className="space-y-4">
                        {currentRoutine.map((item, index) => (
                            <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start">
                                    {/* Step Number */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white flex items-center justify-center font-bold mr-4">
                                        {index + 1}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{item.step}</h3>
                                                <p className="text-rose-600 font-medium">{item.product}</p>
                                            </div>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                {item.time}
                                            </span>
                                        </div>

                                        {/* Application Area */}
                                        <div className="flex items-center text-sm text-gray-600 mb-3">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Apply to: <strong>{item.area}</strong></span>
                                        </div>

                                        {/* Face Map Visual Indicator */}
                                        <div className="relative bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
                                            <div className="text-center">
                                                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-xs text-gray-500 mt-2">Tap for detailed application guide</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Time */}
                    <div className="mt-6 bg-white rounded-xl p-6 shadow-sm text-center">
                        <p className="text-gray-600 mb-1">Total Routine Time</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {currentRoutine.reduce((total, item) => {
                                const time = parseInt(item.time);
                                return total + time;
                            }, 0)} seconds
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-4">
                        <button className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors">
                            Save Routine
                        </button>
                        <button className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-rose-300 transition-colors">
                            Customize
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
}