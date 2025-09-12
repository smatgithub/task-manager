import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PerformanceMetrics from '../components/admin/PerformanceMetrics';
import ScoreSection from '../components/admin/ScoreSection';
import DailySection from '../components/admin/DailySection';
import OTDSection from '../components/admin/OTDSection';
import DelegationSection from '../components/admin/DelegationSection';
import EmployeeSidebar from '../components/admin/EmployeeSidebar';

const AdminTaskReview = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dateRange, setDateRange] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logging
  console.log('AdminTaskReview - User:', user);
  console.log('AdminTaskReview - Auth Loading:', authLoading);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check if user has admin or HOD role
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authenticated</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin' && user.role !== 'hod') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('Fetching employees with token:', token ? 'Present' : 'Missing');
      
      // First try the admin endpoint
      let response = await fetch('/api/admin/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Admin API Response status:', response.status);
      
      // If admin endpoint fails, try the regular users endpoint as fallback
      if (!response.ok && response.status === 404) {
        console.log('Admin endpoint not found, trying users endpoint...');
        response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Users API Response status:', response.status);
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Employees data:', data);
        setEmployees(data);
        if (data.length > 0) {
          setSelectedEmployee(data[0]);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        setError(`Failed to fetch employees: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeUpdate = () => {
    // Trigger data refresh when date range changes
    console.log('Date range updated:', dateRange);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchEmployees();
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Debug Info */}
      <div className="bg-amber-900/20 border-b border-amber-500/30 p-2 text-xs text-amber-200">
        <strong>Debug:</strong> User: {user?.name} | Role: {user?.role} | Employees: {employees.length} | Loading: {loading.toString()} | Error: {error || 'None'}
      </div>
      
      {/* Header */}
      <div className="bg-slate-800 shadow-lg border-b border-slate-700 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">Daily Task Monitoring</h1>
            <div className="flex items-center gap-3">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Ticket
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">{user.name}</span>
                <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">({user.empId || 'N/A'})</span>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Date Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-300">From Date:</label>
              <input
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => setDateRange({...dateRange, fromDate: e.target.value})}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm w-36 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-300">To Date:</label>
              <input
                type="date"
                value={dateRange.toDate}
                onChange={(e) => setDateRange({...dateRange, toDate: e.target.value})}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm w-36 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleDateRangeUpdate}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Employee Sidebar */}
        <div className="w-72 bg-slate-800 shadow-xl border-r border-slate-700 flex-shrink-0 overflow-y-auto">
          <EmployeeSidebar
            employees={employees}
            selectedEmployee={selectedEmployee}
            onEmployeeSelect={setSelectedEmployee}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-slate-900">
          {employees.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Employees Found</h2>
                <p className="text-slate-400 mb-6">There are no employees in the system yet.</p>
                <button 
                  onClick={fetchEmployees}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          ) : selectedEmployee ? (
            <div className="p-6 space-y-6">
              {/* Performance Metrics - Moved to main content area */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-2xl p-6 border border-slate-600">
                <PerformanceMetrics 
                  selectedEmployee={selectedEmployee}
                  dateRange={dateRange}
                />
              </div>

              {/* SCORE Section */}
              <ScoreSection
                selectedEmployee={selectedEmployee}
                dateRange={dateRange}
              />

              {/* DAILY Section */}
              <DailySection
                selectedEmployee={selectedEmployee}
                dateRange={dateRange}
              />

              {/* OTD Section */}
              <OTDSection
                selectedEmployee={selectedEmployee}
                dateRange={dateRange}
              />

              {/* DELEGATION Section */}
              <DelegationSection
                selectedEmployee={selectedEmployee}
                dateRange={dateRange}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-300 text-lg font-medium">Select an employee to view their task activity</p>
                <p className="text-slate-400 text-sm mt-2">Choose from the sidebar to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTaskReview;
