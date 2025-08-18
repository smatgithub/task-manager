import React from 'react';
import { FaMicrosoft } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const handleMicrosoftLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/microsoft';
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-800 mb-6">
          Welcome to ClientConnect
        </h2>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleMicrosoftLogin}
            className="flex items-center justify-center gap-3 px-4 py-2 border border-blue-600 text-blue-700 font-semibold rounded-md hover:bg-blue-50 transition"
          >
            <FaMicrosoft className="h-5 w-5 text-blue-600" />
            Sign in with Microsoft
          </button>

          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 px-4 py-2 border border-red-500 text-red-600 font-semibold rounded-md hover:bg-red-50 transition"
          >
            <FcGoogle className="h-5 w-5" />
            Sign in with Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="text-indigo-600 underline">
            Terms
          </a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
