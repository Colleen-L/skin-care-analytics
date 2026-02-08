import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const TOTAL_STEPS = 6; // 4 form + loading + preferences

const SKIN_COLORS = [
    { id: '1', name: 'Very Fair', color: '#FFE0BD' },
    { id: '2', name: 'Fair', color: '#FFD4A3' },
    { id: '3', name: 'Light', color: '#E8C097' },
    { id: '4', name: 'Light Medium', color: '#D4A574' },
    { id: '5', name: 'Medium', color: '#C68642' },
    { id: '6', name: 'Medium Tan', color: '#A66B2A' },
    { id: '7', name: 'Tan', color: '#8D5524' },
    { id: '8', name: 'Brown', color: '#6B4423' },
    { id: '9', name: 'Dark', color: '#4A2511' },
];

const ETHNICITIES = [
    { id: 'asian', name: 'Asian' },
    { id: 'black', name: 'Black / African' },
    { id: 'hispanic', name: 'Hispanic / Latino' },
    { id: 'white', name: 'White / Caucasian' },
    { id: 'middle-eastern', name: 'Middle Eastern' },
    { id: 'mixed', name: 'Mixed / Other' },
];

const SKIN_DESCRIPTIONS = [
    { id: 'dry', name: 'Dry', desc: 'Feels tight, flaky' },
    { id: 'oily', name: 'Oily', desc: 'Shiny, large pores' },
    { id: 'combination', name: 'Combination', desc: 'Oily T-zone, dry cheeks' },
    { id: 'normal', name: 'Normal', desc: 'Balanced, no issues' },
    { id: 'sensitive', name: 'Sensitive', desc: 'Reactive, easily irritated' },
];

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState({
        skinColor: '',
        skinColorName: '',
        ethnicity: '',
        skinDescription: '',
        age: 25,
    });

    const progressPercent = (step / TOTAL_STEPS) * 100;

    const handleSelect = (field, value, label) => {
        setProfile({ ...profile, [field]: value, ...(label && { [field + 'Name']: label }) });
    };

    const handleNext = () => {
        if (step <= 4) {
            if (step === 4) {
                setStep(5);
                setTimeout(() => {
                    setStep(6);
                    localStorage.setItem('skinProfile', JSON.stringify(profile));
                }, 2500);
            } else {
                setStep(step + 1);
            }
        } else if (step === 6) {
            router.push('/home');
        }
    };

    const handleBack = () => {
        if (step > 1 && step <= 4) setStep(step - 1);
    };

    const isStepComplete = () => {
        switch (step) {
            case 1: return profile.skinColor !== '';
            case 2: return profile.ethnicity !== '';
            case 3: return profile.skinDescription !== '';
            case 4: return true;
            default: return true;
        }
    };

    return (
        <>
            <Head>
                <title>Onboarding - SkinCare AI</title>
            </Head>

            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Onboarding</h1>
                    <span className="text-gray-400">&#60;/&#62;</span>
                </header>

                <main className="max-w-2xl mx-auto px-4 py-8">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div
                            className="w-full h-2 rounded-full bg-pink-200 overflow-hidden"
                            role="progressbar"
                        >
                            <div
                                className="h-full rounded-full bg-rose-600 transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Step 1: Skin Color */}
                    {step === 1 && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">
                                What color is closest to your skin color?
                            </h2>
                            <div className="grid grid-cols-3 gap-4 mb-12">
                                {SKIN_COLORS.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleSelect('skinColor', c.id, c.name)}
                                        className={`aspect-square rounded-lg border-2 transition-all ${
                                            profile.skinColor === c.id
                                                ? 'border-rose-600 ring-2 ring-rose-200'
                                                : 'border-gray-200 hover:border-pink-300'
                                        }`}
                                        style={{ backgroundColor: c.color }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Ethnicity */}
                    {step === 2 && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">
                                What is your ethnicity?
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mb-12">
                                {ETHNICITIES.map((e) => (
                                    <button
                                        key={e.id}
                                        onClick={() => handleSelect('ethnicity', e.id, e.name)}
                                        className={`p-6 rounded-lg border-2 transition-all text-left ${
                                            profile.ethnicity === e.id
                                                ? 'border-rose-600 bg-rose-50'
                                                : 'border-pink-200 bg-pink-50 hover:border-pink-300'
                                        }`}
                                    >
                                        <span className="font-semibold text-gray-900">{e.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Skin Description */}
                    {step === 3 && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">
                                What description best describes your skin?
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mb-12">
                                {SKIN_DESCRIPTIONS.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSelect('skinDescription', s.id, s.name)}
                                        className={`p-6 rounded-lg border-2 transition-all text-left ${
                                            profile.skinDescription === s.id
                                                ? 'border-rose-600 bg-rose-50'
                                                : 'border-pink-200 bg-pink-50 hover:border-pink-300'
                                        }`}
                                    >
                                        <span className="font-semibold text-gray-900 block">{s.name}</span>
                                        <span className="text-sm text-gray-600">{s.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Age Slider */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                                What is your current age?
                            </h2>
                            <div className="mb-12">
                                <div className="inline-block px-8 py-4 bg-pink-100 rounded-lg mb-6">
                                    <span className="text-3xl font-bold text-gray-900">{profile.age}</span>
                                </div>
                                <input
                                    type="range"
                                    min="18"
                                    max="100"
                                    value={profile.age}
                                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) })}
                                    className="w-full h-3 bg-pink-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-600 [&::-webkit-slider-thumb]:cursor-pointer"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 5: Loading */}
                    {step === 5 && (
                        <div className="text-center py-16">
                            <p className="text-xl font-medium text-gray-900 mb-6">
                                Constructing profile for optimized skincare routine......
                            </p>
                            <div className="w-32 h-32 mx-auto rounded-lg bg-pink-200 animate-pulse" />
                        </div>
                    )}

                    {/* Step 6: Preferences Summary */}
                    {step === 6 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                Your Preferences
                            </h2>
                            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 mb-8">
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Skin color</span>
                                    <span className="font-medium">{SKIN_COLORS.find(c => c.id === profile.skinColor)?.name || profile.skinColorName}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Ethnicity</span>
                                    <span className="font-medium">{ETHNICITIES.find(e => e.id === profile.ethnicity)?.name || profile.ethnicity}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Skin type</span>
                                    <span className="font-medium">{SKIN_DESCRIPTIONS.find(s => s.id === profile.skinDescription)?.name || profile.skinDescription}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-gray-600">Age</span>
                                    <span className="font-medium">{profile.age}</span>
                                </div>
                            </div>
                            <p className="text-center text-gray-600 text-sm mb-6">
                                Your profile is ready. We&apos;ll use this to personalize your experience.
                            </p>
                        </div>
                    )}

                    {/* Navigation */}
                    {step <= 4 && (
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!isStepComplete()}
                                className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-auto"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-all"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
