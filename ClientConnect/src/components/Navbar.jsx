import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { logout } from "../utils/auth"; // ✅ Step 1: Import logout utility

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
            <Link
              to="/auth"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;