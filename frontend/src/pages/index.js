import { useRouter } from 'next/router';
import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    setIsLoading(true);
    await router.push('/auth/login');
    // Loading state will naturally reset when page changes
  };

  return (
    <>
      <Head>
        <title>Your Product Name - Welcome</title>
        <meta name="description" content="Your product tagline" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Your Product Name
              </h1>
              <p className="text-xl md:text-2xl text-indigo-600 font-medium mb-6">
                Your compelling tagline goes here
              </p>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                This is a brief summary of your webapp. Explain what makes your
                product unique and how it helps your users solve their problems.
              </p>
            </div>
            <div className="flex justify-center mb-6">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  'Login / Sign Up'
                )}
              </button>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center bg-indigo-50 text-indigo-700 px-6 py-3 rounded-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Mobile app coming soon</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-600">
            <p className="text-sm">
              © 2024 Your Product Name. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}