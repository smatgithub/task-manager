import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPage?: string | null;
  requiredRole?: string | null;
  fallback?: React.ReactNode;
}

const ProtectedRoute = ({ 
  children, 
  requiredPage = null, 
  requiredRole = null, 
  fallback = null 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const { userSettings, appSettings, loading } = useSettings();

  // Show loading while settings are being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have the required permissions to access this page.</p>
        </div>
      </div>
    );
  }

  // Check page access control
  if (requiredPage) {
    // If userSettings is not loaded yet, show loading
    if (!userSettings) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading permissions...</p>
          </div>
        </div>
      );
    }

    const hasPageAccess = userSettings.pageAccess?.[requiredPage];
    console.log('ProtectedRoute - Page access check:', {
      requiredPage,
      userSettings,
      pageAccess: userSettings.pageAccess,
      hasPageAccess,
      userRole: user?.role
    });
    
    // Admin users always have access (fallback)
    if (!hasPageAccess && user?.role !== 'admin') {
      return fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mt-2">
              Contact your administrator if you need access to this feature.
            </p>
            <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>Required Page: {requiredPage}</p>
              <p>User Role: {user?.role}</p>
              <p>Page Access: {JSON.stringify(userSettings.pageAccess)}</p>
              <p>Has Access: {hasPageAccess ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check application feature access
  if (requiredPage === 'chat' && appSettings) {
    const chatEnabled = appSettings.features?.chatEnabled;
    if (!chatEnabled) {
      return fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Feature Disabled</h1>
            <p className="text-gray-600">Chat feature is currently disabled by administrator.</p>
          </div>
        </div>
      );
    }
  }

  if (requiredPage === 'taskCreation' && appSettings) {
    const taskCreationEnabled = appSettings.features?.taskCreationEnabled;
    if (!taskCreationEnabled) {
      return fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Feature Disabled</h1>
            <p className="text-gray-600">Task creation is currently disabled by administrator.</p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
