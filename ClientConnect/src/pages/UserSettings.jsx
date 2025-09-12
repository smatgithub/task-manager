import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserSettings = () => {
  const { user, token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [userPages, setUserPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserSettings();
    fetchUserPageAccess();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/settings/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        console.error('Failed to fetch user settings');
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    }
  };

  const fetchUserPageAccess = async () => {
    try {
      const response = await fetch('/api/page-access/user/' + user.id, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserPages(data.pages);
      } else {
        console.error('Failed to fetch user page access');
      }
    } catch (error) {
      console.error('Error fetching user page access:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updatedSettings) => {
    setSaving(true);
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
        setSettings(data);
        setMessage('Settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update settings');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Error updating settings');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (category, key, value) => {
    const updatedSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        [category]: {
          ...settings.preferences[category],
          [key]: value
        }
      }
    };
    setSettings(updatedSettings);
    updateSettings(updatedSettings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">User Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your page access and preferences
            </p>
          </div>

          {message && (
            <div className={`mx-6 mt-4 p-4 rounded-md ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="p-6 space-y-8">
            {/* Page Access Status (Read-only) */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Page Access</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your page access is controlled by your administrator. Contact them if you need access to additional pages.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPages.map((page) => (
                  <div key={page.pageId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {page.pageName}
                      </h3>
                      <p className="text-xs text-gray-500">{page.pageDescription}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          page.requiredRole === 'admin' 
                            ? 'bg-red-100 text-red-800'
                            : page.requiredRole === 'hod'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {page.requiredRole.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {page.category.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        page.hasAccess
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {page.hasAccess ? 'Access Granted' : 'No Access'}
                      </div>
                      {page.grantedBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          By: {page.grantedBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
              
              {/* Theme */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={settings.preferences.theme}
                  onChange={(e) => handlePreferenceChange('preferences', 'theme', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  disabled={saving}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Notifications</h3>
                <div className="space-y-3">
                  {Object.entries(settings.preferences.notifications).map(([type, enabled]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm text-gray-900 capitalize">
                          {type.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {getNotificationDescription(type)}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => handlePreferenceChange('notifications', type, e.target.checked)}
                          className="sr-only peer"
                          disabled={saving}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getPageDescription = (page) => {
  const descriptions = {
    dashboard: 'Access to the main dashboard',
    taskManagement: 'Create, edit, and manage tasks',
    taskCreation: 'Create new tasks',
    taskBoard: 'View and manage task board',
    profileManagement: 'Edit your profile information',
    chatAccess: 'Use chat features',
    adminPages: 'Access admin-specific pages',
    userManagement: 'Manage other users'
  };
  return descriptions[page] || 'Page access control';
};

const getNotificationDescription = (type) => {
  const descriptions = {
    email: 'Receive email notifications',
    push: 'Receive push notifications',
    taskUpdates: 'Get notified about task updates',
    chatMessages: 'Get notified about new chat messages'
  };
  return descriptions[type] || 'Notification setting';
};

export default UserSettings;
