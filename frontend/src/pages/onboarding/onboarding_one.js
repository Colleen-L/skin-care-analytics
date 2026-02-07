import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState({
        skinColor: '',
        skinType: '',
        ethnicity: '',
        age: '',
        cycleTracking: false
    });

    const skinColors = [
        { id: 'light', name: 'Light', color: '#FFE0BD' },
        { id: 'medium', name: 'Medium', color: '#D4A574' },
        { id: 'olive', name: 'Olive', color: '#C68642' },
        { id: 'brown', name: 'Brown', color: '#8D5524' },
        { id: 'dark', name: 'Dark', color: '#4A2511' }
    ];

    const skinTypes = [
        { id: 'dry', name: 'Dry', icon: '🏜️', description: 'Feels tight, flaky' },
        { id: 'oily', name: 'Oily', icon: '💧', description: 'Shiny, large pores' },
        { id: 'combination', name: 'Combination', icon: '🔄', description: 'Oily T-zone, dry cheeks' },
        { id: 'normal', name: 'Normal', icon: '✨', description: 'Balanced, no issues' },
        { id: 'sensitive', name: 'Sensitive', icon: '🌸', description: 'Reactive, easily irritated' }
    ];

    const ethnicities = [
        { id: 'asian', name: 'Asian', icon: '🌏' },
        { id: 'black', name: 'Black/African', icon: '🌍' },
        { id: 'hispanic', name: 'Hispanic/Latino', icon: '🌎' },
        { id: 'white', name: 'White/Caucasian', icon: '🌐' },
        { id: 'middle-eastern', name: 'Middle Eastern', icon: '🌍' },
        { id: 'mixed', name: 'Mixed/Other', icon: '🌈' }
    ];

    const handleSelect = (field, value) => {
        setProfile({ ...profile, [field]: value });
    };

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Save profile and navigate to home
            localStorage.setItem('skinProfile', JSON.stringify(profile));
            router.push('/home');
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const isStepComplete = () => {
        switch (step) {
            case 1: return profile.skinColor !== '';
            case 2: return profile.skinType !== '';
            case 3: return profile.ethnicity !== '';
            case 4: return true; // Optional fields
            default: return false;
        }
    };

    return (
        <>
            <Head>
                <title>Onboarding - SkinCare AI</title>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-100 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
                            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-rose-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(step / 4) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Step 1: Skin Color */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">What's your skin tone?</h2>
                                <p className="text-gray-600 mb-6">This helps us personalize your experience</p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {skinColors.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => handleSelect('skinColor', color.id)}
                                            className={`p-4 rounded-lg border-2 transition-all ${profile.skinColor === color.id
                                                    ? 'border-rose-600 bg-rose-50'
                                                    : 'border-gray-200 hover:border-rose-300'
                                                }`}
                                        >
                                            <div
                                                className="w-full h-20 rounded-lg mb-2 border border-gray-300"
                                                style={{ backgroundColor: color.color }}
                                            ></div>
                                            <p className="font-medium text-gray-900">{color.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Skin Type */}
                        {step === 2 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">What's your skin type?</h2>
                                <p className="text-gray-600 mb-6">Choose the one that best describes your skin</p>

                                <div className="space-y-3">
                                    {skinTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => handleSelect('skinType', type.id)}
                                            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center ${profile.skinType === type.id
                                                    ? 'border-rose-600 bg-rose-50'
                                                    : 'border-gray-200 hover:border-rose-300'
                                                }`}
                                        >
                                            <span className="text-3xl mr-4">{type.icon}</span>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900">{type.name}</p>
                                                <p className="text-sm text-gray-600">{type.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Ethnicity */}
                        {step === 3 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Select your ethnicity</h2>
                                <p className="text-gray-600 mb-6">This helps us provide more accurate recommendations</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {ethnicities.map((ethnicity) => (
                                        <button
                                            key={ethnicity.id}
                                            onClick={() => handleSelect('ethnicity', ethnicity.id)}
                                            className={`p-4 rounded-lg border-2 transition-all ${profile.ethnicity === ethnicity.id
                                                    ? 'border-rose-600 bg-rose-50'
                                                    : 'border-gray-200 hover:border-rose-300'
                                                }`}
                                        >
                                            <span className="text-4xl mb-2 block">{ethnicity.icon}</span>
                                            <p className="font-medium text-gray-900">{ethnicity.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Optional Info */}
                        {step === 4 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Almost done!</h2>
                                <p className="text-gray-600 mb-6">Help us personalize your experience even more (optional)</p>

                                <div className="space-y-6">
                                    {/* Age */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Age Range
                                        </label>
                                        <select
                                            value={profile.age}
                                            onChange={(e) => handleSelect('age', e.target.value)}
                                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-rose-600 focus:outline-none"
                                        >
                                            <option value="">Select age range (optional)</option>
                                            <option value="under-18">Under 18</option>
                                            <option value="18-24">18-24</option>
                                            <option value="25-34">25-34</option>
                                            <option value="35-44">35-44</option>
                                            <option value="45-54">45-54</option>
                                            <option value="55+">55+</option>
                                        </select>
                                    </div>

                                    {/* Cycle Tracking */}
                                    <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                                        <label className="flex items-start cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={profile.cycleTracking}
                                                onChange={(e) => handleSelect('cycleTracking', e.target.checked)}
                                                className="mt-1 w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                                            />
                                            <div className="ml-3">
                                                <p className="font-medium text-gray-900">Enable Cycle Tracking</p>
                                                <p className="text-sm text-gray-600">
                                                    Track how your skin changes throughout your menstrual cycle for better insights
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={!isStepComplete()}
                                className="px-8 py-3 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {step === 4 ? 'Get Started' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}