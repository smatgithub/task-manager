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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-indigo-800">Welcome to E-Flow</h1>

        {isAuthenticated ? (
          <p className="text-gray-700 text-sm">
            You are already logged in. Redirecting to your dashboard...
          </p>
        ) : (
          <>
            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Auth Mode Toggle */}
            {authMode === 'oauth' && (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setAuthMode('login')}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Register
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleMicrosoftLogin}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                    </svg>
                    Microsoft
                  </button>

                  <button
                    onClick={handleGoogleLogin}
                    className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                </div>
              </div>
            )}

            {/* Login Form */}
            {authMode === 'login' && (
              <div>
                <LoginForm onSuccess={handleAuthSuccess} onCancel={handleAuthCancel} />
                <p className="mt-4 text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthMode('register')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
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
                <p className="mt-4 text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
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