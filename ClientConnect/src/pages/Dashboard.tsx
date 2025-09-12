import { useEffect, useState } from "react";
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

  if (!user) return <p className="p-6 text-center text-slate-300">Loading your dashboard...</p>;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="bg-slate-800/90 backdrop-blur-sm border border-blue-500/30 p-8 rounded-xl shadow-2xl text-center w-full max-w-lg space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Welcome, {user.name}!
        </h1>
        <p className="text-slate-300 text-sm">Email: {user.email}</p>

        <div className="mt-6 space-y-2">
          <p className="text-slate-300">
            You are now logged into the <strong className="text-blue-400">E-Flow</strong> task management system.
          </p>
          <p className="text-slate-400 text-sm">
            Use the navigation menu to manage your tasks, update your profile, or view team boards.
          </p>
        </div>

        <div className="mt-6">
          <Link
            to="/UserTasksBoard"
            className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            Go to Task Board
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;