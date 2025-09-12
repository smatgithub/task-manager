import React, { useEffect, useState } from 'react';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const apiBase =
  import.meta.env.VITE_API_BASE_URL || ""; // empty = same origin

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleMicrosoftLogin = () => {
    window.location.href = `${apiBase}/api/auth/microsoft`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${apiBase}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-black via-slate-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 relative z-10">
        {user ? (
          <>
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 shadow-2xl">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">Welcome, {user.name}!</h2>
              <p className="text-slate-300 mb-8 max-w-xl">You're logged in as {user.email}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-12 border border-blue-500/30 shadow-2xl max-w-2xl">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6 animate-pulse">
                Connect. Collaborate. Deliver.
              </h2>
              <p className="text-slate-300 mb-10 max-w-xl text-lg leading-relaxed">
                One platform to manage tasks, streamline communication, and keep everything on track.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-10">
                <button
                  onClick={handleMicrosoftLogin}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 border border-blue-500/30"
                >
                  <FaMicrosoft className="text-xl" />
                  <span>Login with Microsoft</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={handleGoogleLogin}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 border border-cyan-500/30"
                >
                  <FaGoogle className="text-xl" />
                  <span>Login with Google</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-slate-400 mb-6 text-lg">Don't have an account yet?</p>
                <Link
                  to="/register"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 border border-blue-400/30"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Account
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
