import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const profile = localStorage.getItem('skinProfile');
    if (!profile) {
      router.push('/onboarding/onboarding_one');
      return;
    }
    try {
      const parsed = JSON.parse(profile);
      if (parsed?.userName) setUserName(parsed.userName);
    } catch (_) {}
  }, [router]);

  const buttons = [
    {
      id: 'analysis',
      title: 'Analysis',
      gradient: 'from-[#E8D4F0] to-[#D8C4E8]',
      shadow: 'shadow-[0_3px_10px_rgba(216,196,232,0.35)]',
      route: '/features/analytics',
    },
    {
      id: 'products',
      title: 'Recommended Products',
      gradient: 'from-[#B8E6D4] to-[#A8D5C4]',
      shadow: 'shadow-[0_3px_10px_rgba(168,213,196,0.35)]',
      route: '/features/products',
    },
    {
      id: 'calendar',
      title: 'Calendar',
      gradient: 'from-[#B8C6E6] to-[#A8B5D5]',
      shadow: 'shadow-[0_3px_10px_rgba(168,181,213,0.35)]',
      route: '/features/calendar',
    },
    {
      id: 'routine',
      title: 'Routine Builder',
      gradient: 'from-[#F0D8D0] to-[#E8D0C8]',
      shadow: 'shadow-[0_3px_10px_rgba(232,208,200,0.35)]',
      route: '/features/routine',
    },
  ];

  return (
    <>
      <Head>
        <title>Home - SkinCare AI</title>
      </Head>

      <div
        className="min-h-screen flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #fef6fa 0%, #ffffff 50%, #fef6fa 100%)',
        }}
      >
        {/* Header */}
        <header className="relative z-10 px-6 sm:px-8 pt-6 sm:pt-8 pb-3">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{
                background: '#F5E6DC',
                border: '2px solid #D4A5B8',
              }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: '#8B4367' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: '#8B4367' }}
            >
              Welcome back{userName !== 'User' ? `, ${userName}` : ''}!
            </h1>
          </div>
        </header>

        {/* Main content */}
        <main className="relative z-10 flex-1 flex justify-center px-6 sm:px-8 pb-8 sm:pb-10">
          <div className="flex w-full max-w-5xl mx-auto">
            {/* Left 40% - Hero image placeholder */}
            <div
              className="hidden md:flex flex-1 max-w-[40%] items-center justify-center pr-3 lg:pr-4"
              style={{ minHeight: 360 }}
            >
              <div
                className="w-full aspect-[3/4] max-h-[380px] rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, rgba(254,246,250,0.8) 0%, rgba(255,255,255,0.6) 100%)',
                  border: '2px dashed #D4A5B8',
                }}
              >
                <span
                  className="text-sm font-medium opacity-60"
                  style={{ color: '#8B4367' }}
                >
                  Hero image
                </span>
              </div>
            </div>

            {/* Right 60% - Buttons */}
            <div className="flex-1 md:min-w-[60%] flex flex-col justify-center items-center gap-6 py-4">
            {buttons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => router.push(btn.route)}
                className={`
                  w-1/2 min-w-[140px] md:w-[44%]
                  h-[80px]
                  rounded-xl
                  bg-gradient-to-br ${btn.gradient}
                  ${btn.shadow}
                  hover:scale-[1.02] hover:shadow-lg
                  active:scale-[0.98]
                  transition-all duration-200 ease-out
                  flex items-center justify-center
                `}
              >
                <span className="text-white text-base font-bold tracking-tight drop-shadow-sm">
                  {btn.title}
                </span>
              </button>
            ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
