import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import UserRegistrationForm from '../components/UserRegistrationForm';

const apiBase =
  import.meta.env.VITE_API_BASE_URL || ""; // empty = same origin

const AuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'oauth'
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      // Optional: redirect after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [navigate, isAuthenticated]);

  const handleMicrosoftLogin = () => {
    window.location.href = `${apiBase}/api/auth/microsoft`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${apiBase}/api/auth/google`;
  };

  const handleAuthSuccess = (message) => {
    setSuccessMessage(message);
    if (authMode === 'login') {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      // After registration, switch to login mode
      setTimeout(() => {
        setAuthMode('login');
        setSuccessMessage('');
      }, 3000);
    }
  };

  const handleAuthCancel = () => {
    setAuthMode('oauth');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm p-10 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 border border-blue-500/30 relative z-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Welcome to E-Flow</h1>

        {isAuthenticated ? (
          <p className="text-slate-300 text-sm">
            You are already logged in. Redirecting to your dashboard...
          </p>
        ) : (
          <>
            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-green-400">{successMessage}</p>
              </div>
            )}

            {/* Auth Mode Toggle */}
            {authMode === 'oauth' && (
              <div className="space-y-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setAuthMode('login')}
                    className="group flex-1 py-3 px-6 bg-gradient-to-r from-slate-600 to-slate-700 text-slate-200 rounded-xl hover:from-slate-500 hover:to-slate-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                  >
                    <div className="flex items-center justify-center">
                      <span>Login</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className="group flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                  >
                    <div className="flex items-center justify-center">
                      <span>Register</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-800/50 text-slate-400 backdrop-blur-sm">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleMicrosoftLogin}
                    className="group w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center font-medium"
                  >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                    </svg>
                    <span>Microsoft</span>
                    <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>

                  <button
                    onClick={handleGoogleLogin}
                    className="group w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center font-medium"
                  >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Google</span>
                    <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Login Form */}
            {authMode === 'login' && (
              <div>
                <LoginForm onSuccess={handleAuthSuccess} onCancel={handleAuthCancel} />
                <p className="mt-6 text-sm text-slate-400 text-center">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthMode('register')}
                    className="text-blue-400 hover:text-cyan-400 font-medium transition-colors duration-200 underline"
                  >
                    Register here
                  </button>
                </p>
              </div>
            )}

            {/* Registration Form */}
            {authMode === 'register' && (
              <div>
                <UserRegistrationForm onSuccess={handleAuthSuccess} onCancel={handleAuthCancel} />
                <p className="mt-6 text-sm text-slate-400 text-center">
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-blue-400 hover:text-cyan-400 font-medium transition-colors duration-200 underline"
                  >
                    Login here
                  </button>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;