import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Add your login logic here
    // Example: redirect to auth provider or login page
    console.log('Login clicked');
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <>
      <Head>
        <title>Your Product Name - Welcome</title>
        <meta name="description" content="Your product tagline" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen w-full bg-gradient-to-br from-white to-pink-300">
        {/* 3/10 Width Box */}
       <div className="w-3/10 border-r border-purple-200 flex flex-col p-8 flex-start space-y-8">
        
        {/* TOP: Title & Tagline */}
        <div className="justify-center items-center text-center">
          <div className="border-4 border-purple-200 p-4 flex align-items-center justify-center">
            <h1 className="text-3xl font-bold text-slate-900">Title</h1>
          </div>
          <p className="text-slate-500 mt-2">Tagline</p>
        </div>

        {/* MIDDLE: Username & Password Inputs */}
        {/* Using my-[auto] or a large percentage top padding centers this vertically */}
        <div className="">
          <div className="text-center mb-4">
            <h2 className="block text-lg font-semibold text-slate-800">Login</h2>
          </div>
          <form>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 my-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 my-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-2.5 my-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Submit
            </button>
          </form>
          </div>
        </div>

        {/* 7/10 Width Box */}
        <div className="w-7/10 flex items-center justify-center p-4">
          <div className="text-center">
          </div>
        </div>
      </div>
    </>
  );
}