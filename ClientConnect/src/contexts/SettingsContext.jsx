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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch user settings
      const userResponse = await fetch('/api/settings/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserSettings(userData);
      }

      // Fetch app settings (for feature checks)
      const appResponse = await fetch('/api/settings/feature/chat', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (appResponse.ok) {
        const appData = await appResponse.json();
        // For now, we'll just check individual features as needed
        // In a full implementation, you'd fetch all app settings here
      }

    } catch (error) {
      console.error('Error fetching settings:', error);
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
    refreshSettings: fetchSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
