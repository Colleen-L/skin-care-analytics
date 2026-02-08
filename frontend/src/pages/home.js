import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        router.push('/');
        return;
      }

      try {
        // Fetch user data from backend
        const response = await fetch('http://localhost:8000/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.username);
        } else {
          // Token invalid or expired, redirect to login
          localStorage.removeItem('access_token');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('skinProfile');
    router.push('/');
  };

  const buttons = [
    {
      id: 'calendar',
      title: 'Calendar',
      gif: '/Calendar.gif',
      gradient: 'from-[#B8C6E6] to-[#A8B5D5]',
      shadow: 'shadow-[0_3px_10px_rgba(168,181,213,0.35)]',
      route: '/features/calendar',
    },
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
  ];

  return (
    <>
      <Head>
        <title>Home - SkinCare AI</title>
      </Head>

      {loading ? (
        <div className="h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef6fa 0%, #ffffff 50%, #fef6fa 100%)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#D4A5B8' }}></div>
            <p style={{ color: '#8B4367' }}>Loading...</p>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col overflow-hidden relative">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/IMG_5551.png"
              alt="home background"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content overlay */}
          <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 px-6 sm:px-8 pt-4 sm:pt-6 pb-2 backdrop-blur-sm bg-white/30">
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
                Welcome back{userName ? `, ${userName}` : ''}!
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
        <main className="flex-1 min-h-0 flex flex-col sm:flex-row overflow-hidden px-4 sm:px-6 pb-4 gap-3 sm:gap-4">
          {/* Image section - half */}
          <div
            className="flex-1 min-w-0 min-h-0 flex items-center justify-center"
          >
            <div className="relative w-full max-w-xl aspect-square">
              <img
                src="/home.jpeg"
                alt="Skin care"
                className="w-full h-full object-cover rounded-full opacity-60"
                style={{
                  border: '3px solid rgba(212,165,184,0.4)',
                  boxShadow: '0 4px 20px rgba(212,165,184,0.3)',
                }}
              />
            </div>
          </div>

          {/* Buttons section - half */}
          <div className="flex-1 min-w-0 flex flex-col justify-center items-center px-4">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 
                className="text-4xl font-bold tracking-wide"
                style={{ 
                  color: '#8B4367',
                  textShadow: '0 2px 4px rgba(212,165,184,0.2)'
                }}
              >
                ✨ Let's Glow! ✨
              </h2>
              <p className="mt-2 text-sm opacity-80" style={{ color: '#8B4367' }}>
                Choose your skincare journey
              </p>
            </div>

            {/* Buttons */}
            <div className="w-full max-w-lg space-y-5">
              {buttons.map((btn, index) => (
                <div
                  key={btn.id}
                  onClick={() => router.push(btn.route)}
                  onMouseEnter={() => setHoveredId(btn.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="w-full cursor-pointer group"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`
                  }}
                >
                  <div className="flex items-center gap-4 w-full">
                    {/* GIF Icon */}
                    <div className="flex-shrink-0">
                      <img
                        src={hoveredId === btn.id ? btn.gif : btn.gif.replace('.gif', '.png')}
                        alt=""
                        className="w-48 h-48 sm:w-40 sm:h-40 object-contain transition-transform group-hover:scale-110"
                      />
                    </div>

                    {/* Button */}
                    <button
                      type="button"
                      className={`
                        flex-1
                        h-[100px]
                        px-8
                        rounded-2xl
                        bg-gradient-to-br ${btn.gradient}
                        ${btn.shadow}
                        group-hover:scale-[1.03] group-hover:shadow-xl
                        active:scale-[0.98]
                        transition-all duration-300 ease-out
                        flex items-center justify-center
                        border-2 border-white/30
                      `}
                    >
                      <span className="text-white text-xl font-bold tracking-tight drop-shadow-md">
                        {btn.title}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        </div>
      </div>
      )}
    </>
  );
}

// Add these styles to your global CSS or include them here
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}