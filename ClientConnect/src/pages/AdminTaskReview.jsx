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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Debug Info */}
      <div className="bg-yellow-100 border-b p-2 text-xs">
        <strong>Debug:</strong> User: {user?.name} | Role: {user?.role} | Employees: {employees.length} | Loading: {loading.toString()} | Error: {error || 'None'}
      </div>
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Daily Task Monitoring</h1>
            <div className="flex items-center gap-3">
              <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 text-sm">
                Create Ticket
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user.name}</span>
                <span className="text-xs text-gray-500">({user.empId || 'N/A'})</span>
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Date Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From Date:</label>
              <input
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => setDateRange({...dateRange, fromDate: e.target.value})}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To Date:</label>
              <input
                type="date"
                value={dateRange.toDate}
                onChange={(e) => setDateRange({...dateRange, toDate: e.target.value})}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm w-32"
              />
              <button
                onClick={handleDateRangeUpdate}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 text-sm"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Employee Sidebar */}
        <div className="w-72 bg-white shadow-sm border-r flex-shrink-0 overflow-y-auto">
          <EmployeeSidebar
            employees={employees}
            selectedEmployee={selectedEmployee}
            onEmployeeSelect={setSelectedEmployee}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {employees.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-600 mb-2">No Employees Found</h2>
                <p className="text-gray-500 mb-4">There are no employees in the system yet.</p>
                <button 
                  onClick={fetchEmployees}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : selectedEmployee ? (
            <div className="p-4 space-y-4">
              {/* Performance Metrics - Moved to main content area */}
              <div className="bg-white rounded-lg shadow p-4">
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
                <p className="text-gray-500 text-lg">Select an employee to view their task activity</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTaskReview;
