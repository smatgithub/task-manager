import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [userSettings, setUserSettings] = useState(null);
  const [appSettings, setAppSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token, user]);

  // Add global refresh mechanism
  useEffect(() => {
    const handleRefreshPermissions = async () => {
      if (isAuthenticated && token) {
        try {
          const pageAccessResponse = await fetch('/api/page-access/my-access', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (pageAccessResponse.ok) {
            const pageAccessData = await pageAccessResponse.json();
            setUserSettings(prev => ({
              ...prev,
              pageAccess: pageAccessData.pageAccess || {},
              user: pageAccessData.user || prev?.user
            }));
          }
        } catch (error) {
          console.error('Error refreshing page access:', error);
        }
      }
    };

    // Listen for custom refresh event
    window.addEventListener('refreshPermissions', handleRefreshPermissions);
    
    return () => {
      window.removeEventListener('refreshPermissions', handleRefreshPermissions);
    };
  }, [isAuthenticated, token]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch user page access from backend
      const pageAccessResponse = await fetch('/api/page-access/my-access', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let pageAccessData = null;
      if (pageAccessResponse.ok) {
        pageAccessData = await pageAccessResponse.json();
        console.log('Page access data received:', pageAccessData);
      } else {
        console.error('Failed to fetch page access:', pageAccessResponse.status, pageAccessResponse.statusText);
      }

      // Fetch user settings (for other preferences)
      const userResponse = await fetch('/api/settings/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let userData = null;
      if (userResponse.ok) {
        userData = await userResponse.json();
      }

      // Combine all settings data
      setUserSettings({
        ...userData,
        pageAccess: pageAccessData?.pageAccess || {},
        user: pageAccessData?.user || userData?.user
      });

      // Fetch app settings (for feature checks)
      const appSettingsResponse = await fetch('/api/settings/app', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (appSettingsResponse.ok) {
        const appSettingsData = await appSettingsResponse.json();
        setAppSettings(appSettingsData);
      } else {
        // Fallback: fetch individual features
        const [chatResponse, taskCreationResponse] = await Promise.all([
          fetch('/api/settings/feature/chat'),
          fetch('/api/settings/feature/taskCreation')
        ]);

        const chatData = chatResponse.ok ? await chatResponse.json() : { enabled: true };
        const taskCreationData = taskCreationResponse.ok ? await taskCreationResponse.json() : { enabled: true };

        setAppSettings({
          features: {
            chatEnabled: chatData.enabled,
            taskCreationEnabled: taskCreationData.enabled
          }
        });
      }

    } catch (error) {
      console.error('Error fetching settings:', error);
      // Set default values to prevent app crash
      setUserSettings({
        pageAccess: {},
        user: user
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserSettings = async (updatedSettings) => {
    try {
      const response = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSettings)
      });

      if (response.ok) {
        const data = await response.json();
        setUserSettings(data);
        return data;
      } else {
        throw new Error('Failed to update user settings');
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  };

  const checkFeatureEnabled = async (feature) => {
    try {
      const response = await fetch(`/api/settings/feature/${feature}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.enabled;
      }
      return true; // Default to enabled if check fails
    } catch (error) {
      console.error('Error checking feature status:', error);
      return true; // Default to enabled if check fails
    }
  };

  const hasPageAccess = (page) => {
    if (!userSettings) return false;
    return userSettings.pageAccess?.[page] || false;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    userSettings,
    appSettings,
    loading,
    updateUserSettings,
    checkFeatureEnabled,
    hasPageAccess,
    hasRole,
    refreshSettings: fetchSettings,
    refreshPageAccess: async () => {
      try {
        const pageAccessResponse = await fetch('/api/page-access/my-access', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (pageAccessResponse.ok) {
          const pageAccessData = await pageAccessResponse.json();
          setUserSettings(prev => ({
            ...prev,
            pageAccess: pageAccessData.pageAccess || {},
            user: pageAccessData.user || prev?.user
          }));
          return pageAccessData;
        }
      } catch (error) {
        console.error('Error refreshing page access:', error);
      }
    }
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
