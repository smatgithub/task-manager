// import { useState, useMemo, useEffect } from "react";
import { FaMicrosoft } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
const apiBase =
  import.meta.env.VITE_API_BASE_URL || ""; // empty = same origin

const Login = () => {
  const handleMicrosoftLogin = () => {
    window.location.href = `${apiBase}/api/auth/microsoft`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${apiBase}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full max-w-md border border-blue-500/30 relative z-10">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-8">
          Welcome to ClientConnect
        </h2>

        <div className="flex flex-col space-y-6">
          <button
            onClick={handleMicrosoftLogin}
            className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 border border-blue-500/30"
          >
            <FaMicrosoft className="h-6 w-6" />
            <span>Sign in with Microsoft</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <button
            onClick={handleGoogleLogin}
            className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 border border-cyan-500/30"
          >
            <FcGoogle className="h-6 w-6" />
            <span>Sign in with Google</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-400 hover:text-cyan-400 underline transition-colors">
            Terms
          </a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
