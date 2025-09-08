import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow fixed top-0 w-full z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between p-4 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="text-indigo-600 font-bold text-xl">
            ClientConnect
          </Link>
        </div>

        <div className="flex flex-row gap-6 items-center">
          <Link to="/">Home</Link>
          <Link to="/UserTasksBoard">UserTasksBoard</Link>
          <Link to="/tasksForm">Tasks Forms</Link>
          <Link to="/profile">User Profile</Link>
          {user && (
            <button 
              onClick={() => {
                const chatWindow = document.getElementById('chat-window');
                if (chatWindow) {
                  const isHidden = chatWindow.classList.contains('hidden');
                  
                  if (isHidden) {
                    // Show and center the window
                    chatWindow.classList.remove('hidden');
                    
                    // Center the window
                    setTimeout(() => {
                      const windowWidth = window.innerWidth;
                      const windowHeight = window.innerHeight;
                      const chatWidth = 384; // Default width
                      const chatHeight = 600; // Default height
                      
                      const centerX = Math.max(0, (windowWidth - chatWidth) / 2);
                      const centerY = Math.max(0, (windowHeight - chatHeight) / 2);
                      
                      chatWindow.style.left = `${centerX}px`;
                      chatWindow.style.top = `${centerY}px`;
                    }, 10);
                  } else {
                    // Hide the window
                    chatWindow.classList.add('hidden');
                  }
                } else {
                  console.error('Chat window not found. Please refresh the page.');
                }
              }}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
            </button>
          )}
          {user && (user.role === 'admin' || user.role === 'hod') && (
            <Link to="/users">User Management</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm italic text-gray-600">
                Welcome, {user?.name || "User"}
              </span>
              <button
                onClick={logout} // ✅ Step 2: Use logout
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/auth"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;