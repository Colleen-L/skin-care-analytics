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

            <div className="min-h-screen flex flex-col relative">
                {/* Background - Product 2.gif across all onboarding steps */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/Product%202.gif"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div
                        className="absolute inset-0 z-[1]"
                        style={{ background: 'rgba(254,242,249,0.75)' }}
                    />
                </div>

                {/* Header - Pastel layout */}
                <header
                    className="relative z-10 flex-shrink-0 border-b px-4 sm:px-6 py-4 flex items-center gap-3"
                    style={{
                        background: 'rgba(255,255,255,0.9)',
                        borderColor: '#E8D4DC',
                    }}
                >
                    <div
                        className="flex-shrink-0 w-[58px] h-[58px] rounded-full overflow-hidden"
                        style={{ border: '2px solid #D4A5B8' }}
                    >
                        <img
                            src="/commerce-bg.jpeg"
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h1 className="text-xl font-bold" style={{ color: '#8B4367' }}>Onboarding</h1>
                </header>

                <main className="relative z-10 flex-1 min-h-0 overflow-y-auto flex flex-col">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div
                            className="w-full h-2.5 rounded-full overflow-hidden"
                            style={{ background: '#F0E4E8' }}
                            role="progressbar"
                        >
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #D4A5B8 0%, #B8C6E6 100%)' }}
                            />
                        </div>
                    </div>

                    {/* Content Card - Structured layout below progress bar */}
                    <div
                        className="flex-1 flex flex-col rounded-2xl p-6 sm:p-8 mb-6"
                        style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: '1px solid #E8D4DC',
                            boxShadow: '0 2px 12px rgba(212,165,184,0.15)',
                        }}
                    >
                    {/* Step 1: Skin Color */}
                    {step === 1 && (
                        <div className="text-center">
                            <h2 className="text-xl font-bold mb-6" style={{ color: '#8B4367' }}>
                                What color is closest to your skin color?
                            </h2>
                            <div className="grid grid-cols-3 gap-4 mb-2">
                                {SKIN_COLORS.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleSelect('skinColor', c.id, c.name)}
                                        className={`aspect-square rounded-xl border-2 transition-all ${
                                            profile.skinColor === c.id
                                                ? 'ring-2'
                                                : ''
                                        }`}
                                        style={{
                                            backgroundColor: c.color,
                                            borderColor: profile.skinColor === c.id ? '#D4A5B8' : '#E8D4DC',
                                            boxShadow: profile.skinColor === c.id ? '0 0 0 2px rgba(212,165,184,0.3)' : 'none',
                                        }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Ethnicity */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#8B4367' }}>
                                What is your ethnicity?
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {ETHNICITIES.map((e) => (
                                    <button
                                        key={e.id}
                                        onClick={() => handleSelect('ethnicity', e.id, e.name)}
                                        className={`p-5 rounded-xl border-2 transition-all text-left ${
                                            profile.ethnicity === e.id
                                                ? ''
                                                : ''
                                        }`}
                                        style={{
                                            background: profile.ethnicity === e.id ? '#F5F0F2' : 'rgba(255,255,255,0.8)',
                                            borderColor: profile.ethnicity === e.id ? '#D4A5B8' : '#E8D4DC',
                                            color: '#8B4367',
                                        }}
                                    >
                                        <span className="font-semibold">{e.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Skin Description */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#8B4367' }}>
                                What description best describes your skin?
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {SKIN_DESCRIPTIONS.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSelect('skinDescription', s.id, s.name)}
                                        className={`p-5 rounded-xl border-2 transition-all text-left ${
                                            profile.skinDescription === s.id
                                                ? ''
                                                : ''
                                        }`}
                                        style={{
                                            background: profile.skinDescription === s.id ? '#F5F0F2' : 'rgba(255,255,255,0.8)',
                                            borderColor: profile.skinDescription === s.id ? '#D4A5B8' : '#E8D4DC',
                                            color: '#8B4367',
                                        }}
                                    >
                                        <span className="font-semibold block" style={{ color: '#8B4367' }}>{s.name}</span>
                                        <span className="text-sm" style={{ color: '#A67B8B' }}>{s.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Age Slider */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#8B4367' }}>
                                What is your current age?
                            </h2>
                            <div className="space-y-6">
                                <div
                                    className="inline-block px-8 py-4 rounded-xl mb-2"
                                    style={{ background: '#F5F0F2', border: '1px solid #E8D4DC' }}
                                >
                                    <span className="text-3xl font-bold" style={{ color: '#8B4367' }}>{profile.age}</span>
                                </div>
                                <input
                                    type="range"
                                    min="18"
                                    max="100"
                                    value={profile.age}
                                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) })}
                                    className="w-full h-3 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                                    style={{
                                        background: '#F0E4E8',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 5: Loading */}
                    {step === 5 && (
                        <div className="text-center py-16 flex flex-col items-center">
                            <p className="text-lg font-medium mb-6" style={{ color: '#8B4367' }}>
                                Constructing profile for optimized skincare routine......
                            </p>
                            <img
                                src="/Routine.gif"
                                alt=""
                                className="w-40 h-40 sm:w-48 sm:h-48 object-contain mx-auto"
                            />
                        </div>
                    )}

                    {/* Step 6: Preferences Summary */}
                    {step === 6 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#8B4367' }}>
                                Your Preferences
                            </h2>
                            <div
                                className="rounded-xl p-6 space-y-4 mb-6"
                                style={{
                                    background: 'rgba(255,255,255,0.8)',
                                    border: '1px solid #E8D4DC',
                                }}
                            >
                                <div className="flex justify-between py-3 border-b" style={{ borderColor: '#F0E4E8' }}>
                                    <span style={{ color: '#8B4367' }}>Skin color</span>
                                    <span className="font-medium" style={{ color: '#8B4367' }}>{SKIN_COLORS.find(c => c.id === profile.skinColor)?.name || profile.skinColorName}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b" style={{ borderColor: '#F0E4E8' }}>
                                    <span style={{ color: '#8B4367' }}>Ethnicity</span>
                                    <span className="font-medium" style={{ color: '#8B4367' }}>{ETHNICITIES.find(e => e.id === profile.ethnicity)?.name || profile.ethnicity}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b" style={{ borderColor: '#F0E4E8' }}>
                                    <span style={{ color: '#8B4367' }}>Skin type</span>
                                    <span className="font-medium" style={{ color: '#8B4367' }}>{SKIN_DESCRIPTIONS.find(s => s.id === profile.skinDescription)?.name || profile.skinDescription}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span style={{ color: '#8B4367' }}>Age</span>
                                    <span className="font-medium" style={{ color: '#8B4367' }}>{profile.age}</span>
                                </div>
                            </div>
                            <p className="text-center text-sm" style={{ color: '#8B4367' }}>
                                Your profile is ready. We&apos;ll use this to personalize your experience.
                            </p>
                        </div>
                    )}
                    </div>

                    {/* Navigation - always at bottom */}
                    {step <= 4 ? (
                        <div className="flex justify-between items-center mt-8 pt-6">
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className="px-5 py-2.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                style={{ color: '#8B4367' }}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!isStepComplete()}
                                className="w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-auto"
                                style={{ background: 'linear-gradient(135deg, #D4A5B8 0%, #B8C6E6 100%)', color: '#fff' }}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                        </div>
                    ) : step === 6 ? (
                        <div className="flex justify-end mt-8 pt-6">
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 rounded-xl font-semibold transition-all"
                                style={{ background: 'linear-gradient(135deg, #D4A5B8 0%, #B8C6E6 100%)', color: '#fff' }}
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    ) : null}
                    </div>
                </main>
                <style jsx global>{`
                    input[type="range"]::-webkit-slider-thumb {
                        background: linear-gradient(135deg, #D4A5B8 0%, #B8C6E6 100%) !important;
                    }
                `}</style>
            </div>
        </>
    );
}
