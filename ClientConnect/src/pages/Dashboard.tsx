import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('user');

    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      navigate('/auth'); // Redirect to login if not found
    }
  }, [navigate]);

  if (!user) return <p className="p-6 text-center text-gray-600">Loading your dashboard...</p>;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center w-full max-w-lg space-y-4">
        <h1 className="text-3xl font-bold text-indigo-700">Welcome, {user.name}!</h1>
        <p className="text-gray-700 text-sm">Email: {user.email}</p>

        <div className="mt-6 space-y-2">
          <p className="text-gray-600">
            You are now logged into the <strong>E-Flow</strong> task management system.
          </p>
          <p className="text-gray-500 text-sm">
            Use the navigation menu to manage your tasks, update your profile, or view team boards.
          </p>
        </div>

        <div className="mt-6">
          <Link
            to="/UserTasksBoard"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Go to Task Board
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;