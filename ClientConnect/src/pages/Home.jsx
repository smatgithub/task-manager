import React, { useEffect, useState } from 'react';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
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
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-indigo-100 to-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-indigo-700">ClientConnect</h1>
        <nav className="space-x-4">
          <a href="#features" className="text-indigo-600 hover:underline">Features</a>
          <a href="#contact" className="text-indigo-600 hover:underline">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        {user ? (
          <>
            <h2 className="text-4xl font-bold text-indigo-800 mb-4">Welcome, {user.name}!</h2>
            <p className="text-gray-600 mb-8 max-w-xl">You're logged in as {user.email}</p>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-indigo-800 mb-4">Connect. Collaborate. Deliver.</h2>
            <p className="text-gray-600 mb-8 max-w-xl">One platform to manage tasks, streamline communication, and keep everything on track.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleMicrosoftLogin}
                className="flex items-center justify-center gap-3 px-6 py-3 border border-blue-600 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition"
              >
                <FaMicrosoft /> Login with Microsoft
              </button>
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 px-6 py-3 border border-red-600 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition"
              >
                <FaGoogle /> Login with Google
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
