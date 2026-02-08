import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  const [userName, setUserName] = useState('User');
  const [hoveredId, setHoveredId] = useState(null);

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


  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('skinProfile');
    router.push('/');
  };

  const buttons = [
    {
      id: 'analysis',
      title: 'Analysis',
      gif: '/Analysis.gif',
      gradient: 'from-[#E8D4F0] to-[#D8C4E8]',
      shadow: 'shadow-[0_3px_10px_rgba(216,196,232,0.35)]',
      route: '/features/analytics',
    },
    {
      id: 'products',
      title: 'Recommended Products',
      gif: '/Commerce.gif',
      gradient: 'from-[#B8E6D4] to-[#A8D5C4]',
      shadow: 'shadow-[0_3px_10px_rgba(168,213,196,0.35)]',
      route: '/features/products',
    },
    {
      id: 'calendar',
      title: 'Calendar',
      gif: '/Calendar.gif',
      gradient: 'from-[#B8C6E6] to-[#A8B5D5]',
      shadow: 'shadow-[0_3px_10px_rgba(168,181,213,0.35)]',
      route: '/features/calendar',
    },
  ];

  return (
    <>
      <Head>
        <title>Home - SkinCare AI</title>
      </Head>

      <div
        className="h-screen flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #fef6fa 0%, #ffffff 50%, #fef6fa 100%)',
        }}
      >
        {/* Header */}
        <header className="relative z-10 flex-shrink-0 px-6 sm:px-8 pt-4 sm:pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0 overflow-hidden"
                style={{
                  border: '2px solid #D4A5B8',
                }}
              >
                <img
                  src="/commerce-bg.jpeg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ color: '#8B4367' }}
              >
                Welcome back{userName !== 'User' ? `, ${userName}` : ''}!
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl font-semibold transition-colors"
              style={{ color: '#8B4367' }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main content - 50/50 split */}
        <main className="relative z-10 flex-1 min-h-0 flex flex-col sm:flex-row overflow-hidden px-4 sm:px-6 pb-4 gap-3 sm:gap-4">
          {/* Image section - half */}
          <div
            className="flex-1 min-w-0 min-h-0 rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              border: '1px solid #E8D4DC',
              boxShadow: '0 2px 12px rgba(212,165,184,0.15)',
            }}
          >
            <img
              src="/home.jpeg"
              alt="Skin care"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Buttons section - half */}
          <div className="flex-1 min-w-0 flex flex-col justify-center items-center gap-5 sm:gap-6">
          {buttons.map((btn) => (
  <div
    key={btn.id}
    onClick={() => router.push(btn.route)}
    onMouseEnter={() => setHoveredId(btn.id)}
    onMouseLeave={() => setHoveredId(null)}
    className="flex items-center justify-center gap-3 cursor-pointer group"
  >
    <img
      src={hoveredId === btn.id ? btn.gif : btn.gif.replace('.gif', '.png')}
      alt=""
      className="w-32 h-32 sm:w-40 sm:h-40 object-contain flex-shrink-0"
    />

    <button
      type="button"
      className={`
        max-w-[280px]
        h-[64px] sm:h-[72px]
        px-6 sm:px-8
        rounded-xl
        bg-gradient-to-br ${btn.gradient}
        ${btn.shadow}
        group-hover:scale-[1.02] group-hover:shadow-lg
        active:scale-[0.98]
        transition-all duration-200 ease-out
        flex items-center justify-center
      `}
    >
      <span className="text-white text-base sm:text-lg font-bold tracking-tight drop-shadow-sm text-center">
        {btn.title}
      </span>
    </button>
  </div>
))}

          </div>
        </main>
      </div>
    </>
  );
}
