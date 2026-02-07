import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    // Check if user has completed onboarding
    const profile = localStorage.getItem('skinProfile');
    if (!profile) {
      router.push('/onboarding/onboarding_one');
    }
  }, []);

  const features = [
    {
      id: 'routine',
      title: 'Routine Builder',
      description: 'Create your personalized AM/PM skincare routine',
      icon: '🌅',
      color: 'from-orange-400 to-pink-500',
      route: '/features/routine'
    },
    {
      id: 'products',
      title: 'Product Recommendations',
      description: 'Discover products perfect for your skin',
      icon: '✨',
      color: 'from-purple-400 to-pink-500',
      route: '/features/products'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Track your skin progress over time',
      icon: '📊',
      color: 'from-blue-400 to-cyan-500',
      route: '/features/analytics'
    },
    {
      id: 'calendar',
      title: 'Tracker & Calendar',
      description: 'Log daily routines and scan your skin',
      icon: '📅',
      color: 'from-green-400 to-emerald-500',
      route: '/features/calendar'
    }
  ];

  return (
    <>
      <Head>
        <title>Home - SkinCare AI</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">SkinCare AI</h1>
            <button
              onClick={() => router.push('/profile')}
              className="p-2 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userName}! 👋
            </h2>
            <p className="text-gray-600">
              Your personalized skincare journey continues
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Current Streak</p>
                  <p className="text-3xl font-bold text-gray-900">7 days</p>
                </div>
                <div className="text-4xl">🔥</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Skin Progress</p>
                  <p className="text-3xl font-bold text-green-600">+12%</p>
                </div>
                <div className="text-4xl">📈</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Products Matched</p>
                  <p className="text-3xl font-bold text-gray-900">24</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => router.push(feature.route)}
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-rose-600 font-medium">
                    <span className="text-sm">Get started</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Chatbot Widget */}
          <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                <p className="text-purple-100">Chat with our AI assistant</p>
              </div>
              <button
                onClick={() => router.push('/chat')}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Ask a Question
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}