import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleChatToggle = (chatType) => {
    const chatWindow = document.getElementById(chatType === 'enhanced' ? 'enhanced-chat-window' : 'chat-window');
    if (chatWindow) {
      const isHidden = chatWindow.classList.contains('hidden');
      
      if (isHidden) {
        chatWindow.classList.remove('hidden');
        setTimeout(() => {
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          const chatWidth = chatType === 'enhanced' ? 800 : 384;
          const chatHeight = chatType === 'enhanced' ? 700 : 600;
          
          const centerX = Math.max(0, (windowWidth - chatWidth) / 2);
          const centerY = Math.max(0, (windowHeight - chatHeight) / 2);
          
          chatWindow.style.left = `${centerX}px`;
          chatWindow.style.top = `${centerY}px`;
        }, 10);
      } else {
        chatWindow.classList.add('hidden');
      }
    }
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-2xl border-b border-blue-500/30 fixed top-0 w-full z-50 backdrop-blur-sm">
      <nav className="w-full px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold text-2xl hover:from-blue-300 hover:to-cyan-300 transition-all duration-300">
              ClientConnect
            </Link>
          </div>

          {/* Main Navigation */}
          <div ref={dropdownRef} className="hidden lg:flex items-center space-x-8">
            {!user && (
              <Link to="/" className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium text-lg">
                Home
              </Link>
            )}
            
            {/* Task Management Dropdown - Only for logged in users */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('tasks')}
                  className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium text-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Task Management
                  <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'tasks' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              
              {activeDropdown === 'tasks' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-blue-500/30 py-2 z-50">
                  <Link
                    to="/tasksForm"
                    className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Task Forms
                    </div>
                  </Link>
                  <Link
                    to="/UserTasksBoard"
                    className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2" />
                      </svg>
                      User Task Dashboard
                    </div>
                  </Link>
                  {user && (user.role === 'admin' || user.role === 'hod') && (
                    <Link
                      to="/admin"
                      className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Task Review
                      </div>
                    </Link>
                  )}
                </div>
              )}
              </div>
            )}

            {/* Communication Dropdown - Only for logged in users */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('communication')}
                  className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium text-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Communication
                  <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'communication' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              
              {activeDropdown === 'communication' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-blue-500/30 py-2 z-50">
                  <button
                    onClick={() => {
                      handleChatToggle('basic');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Basic Chat
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleChatToggle('enhanced');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Enhanced Chat
                    </div>
                  </button>
                </div>
              )}
              </div>
            )}

            {/* Settings Dropdown - Only for logged in users */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('settings')}
                  className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium text-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                  <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'settings' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              
              {activeDropdown === 'settings' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-blue-500/30 py-2 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </div>
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      My Settings
                    </div>
                  </Link>
                  {user && user.role === 'admin' && (
                    <>
                      <div className="border-t border-gray-600 my-2"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Administration</p>
                      </div>
                      <Link
                        to="/user-access-control"
                        className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          User Access Control
                        </div>
                      </Link>
                      <Link
                        to="/application-settings"
                        className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Application Settings
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              )}
              </div>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:block text-right">
                  <div className="text-sm text-slate-300">
                    Welcome, <span className="font-medium">{user?.name || "User"}</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate max-w-32">
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-700/30 text-red-400 hover:text-red-300 hover:bg-red-700/50 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth"
                  className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden mt-3">
          <button
            onClick={() => handleDropdownToggle('mobile')}
            className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </button>
          
          {activeDropdown === 'mobile' && (
            <div className="mt-2 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-blue-500/30 py-2">
              {!user && (
                <Link
                  to="/"
                  className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                  onClick={() => setActiveDropdown(null)}
                >
                  Home
                </Link>
              )}
              {user && (
                <>
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Task Management</p>
                  </div>
                  <Link
                    to="/tasksForm"
                    className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Task Forms
                  </Link>
                  <Link
                    to="/UserTasksBoard"
                    className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setActiveDropdown(null)}
                  >
                    User Task Dashboard
                  </Link>
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Communication</p>
                  </div>
                  <button
                    onClick={() => {
                      handleChatToggle('basic');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                  >
                    Basic Chat
                  </button>
                  <button
                    onClick={() => {
                      handleChatToggle('enhanced');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                  >
                    Enhanced Chat
                  </button>
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Account</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setActiveDropdown(null)}
                  >
                    My Settings
                  </Link>
                  {user.role === 'admin' && (
                    <>
                      <div className="border-t border-gray-600 my-2"></div>
                      <div className="px-4 py-2">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Administration</p>
                      </div>
                      <Link
                        to="/user-access-control"
                        className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                        onClick={() => setActiveDropdown(null)}
                      >
                        User Access Control
                      </Link>
                      <Link
                        to="/application-settings"
                        className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-blue-400 transition-colors duration-200"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Application Settings
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;