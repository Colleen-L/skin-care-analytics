import { useState, useEffect } from 'react';

/**
 * Progress bar component for transaction confirmation steps
 * @param {Object} props - Component props
 * @param {number} props.steps - Total number of steps
 * @param {number} props.currentStep - Current step (1-based)
 * @param {Array} props.stepLabels - Labels for each step
 */
export function ProgressBar({ steps = 3, currentStep = 0, stepLabels = [] }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const percentage = (currentStep / steps) * 100;
        setProgress(Math.min(percentage, 100));
    }, [currentStep, steps]);

    const stepItems = Array.from({ length: steps }, (_, i) => i + 1);

    return (
        <div className="w-full">
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Step indicators */}
            {stepLabels.length > 0 && (
                <div className="flex justify-between text-xs text-gray-600">
                    {stepLabels.map((label, index) => (
                        <div
                            key={index}
                            className={`flex-1 text-center ${
                                index + 1 <= currentStep ? 'text-purple-600 font-semibold' : ''
                            }`}
                        >
                            {label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Transaction confirmation progress component
 */
export function TransactionProgress({ status = 'pending' }) {
    const steps = ['Creating', 'Signing', 'Confirming'];
    let currentStep = 0;

    if (status === 'creating') currentStep = 1;
    else if (status === 'signing') currentStep = 2;
    else if (status === 'confirming') currentStep = 3;
    else if (status === 'confirmed') currentStep = 3;

    return (
        <div className="w-full p-4 bg-gray-50 rounded-lg">
            <ProgressBar steps={3} currentStep={currentStep} stepLabels={steps} />
            <p className="text-sm text-gray-600 text-center mt-2">
                {status === 'confirmed' ? 'Transaction confirmed!' : `Step ${currentStep} of 3`}
            </p>
        </div>
    );
}

export default ProgressBar;

