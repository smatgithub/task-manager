import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const apiBase =
  import.meta.env.VITE_API_BASE_URL || ""; // empty = same origin

const AuthPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setIsLoggedIn(true);
      // Optional: redirect after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [navigate]);

  const handleMicrosoftLogin = () => {
    window.location.href = `${apiBase}/api/auth/microsoft`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${apiBase}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-indigo-800">Welcome to E-Flow</h1>

        {isLoggedIn ? (
          <p className="text-gray-700 text-sm">
            You are already logged in. Redirecting to your dashboard...
          </p>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleMicrosoftLogin}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Login with Microsoft
            </button>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Login with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;