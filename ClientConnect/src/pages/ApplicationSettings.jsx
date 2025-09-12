import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ApplicationSettings = () => {
  const { user, token } = useAuth();
  const [appSettings, setAppSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAppSettings();
    }
  }, [user]);

  const fetchAppSettings = async () => {
    try {
      const response = await fetch('/api/settings/app', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppSettings(data);
      } else {
        console.error('Failed to fetch app settings');
      }
    } catch (error) {
      console.error('Error fetching app settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppSettings = async (updatedSettings) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/app', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSettings)
      });

      if (response.ok) {
        const data = await response.json();
        setAppSettings(data);
        setMessage('Application settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update application settings');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating app settings:', error);
      setMessage('Error updating application settings');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureChange = (category, key, value) => {
    const updatedSettings = {
      ...appSettings,
      [category]: {
        ...appSettings[category],
        [key]: value
      }
    };
    setAppSettings(updatedSettings);
    updateAppSettings(updatedSettings);
  };

  const handleNestedFeatureChange = (category, subCategory, key, value) => {
    const updatedSettings = {
      ...appSettings,
      [category]: {
        ...appSettings[category],
        [subCategory]: {
          ...appSettings[category][subCategory],
          [key]: value
        }
      }
    };
    setAppSettings(updatedSettings);
    updateAppSettings(updatedSettings);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Application Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Configure application-wide features and settings
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
            {/* Application Features */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Application Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appSettings && Object.entries(appSettings.features).map(([feature, value]) => (
                  <div key={feature} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-900 mb-4 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    {typeof value === 'boolean' ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Enable Feature</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleFeatureChange('features', feature, e.target.checked)}
                            className="sr-only peer"
                            disabled={saving}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(value).map(([subFeature, subValue]) => (
                          <div key={subFeature} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                              {subFeature.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={subValue}
                                onChange={(e) => handleNestedFeatureChange('features', feature, subFeature, e.target.checked)}
                                className="sr-only peer"
                                disabled={saving}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Security Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={appSettings?.security?.sessionTimeout || 480}
                    onChange={(e) => handleFeatureChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={saving}
                    min="1"
                    max="1440"
                  />
                  <p className="mt-1 text-xs text-gray-500">Maximum session duration in minutes</p>
                </div>
                
                <div className="p-6 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={appSettings?.security?.maxLoginAttempts || 5}
                    onChange={(e) => handleFeatureChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={saving}
                    min="1"
                    max="10"
                  />
                  <p className="mt-1 text-xs text-gray-500">Maximum failed login attempts before lockout</p>
                </div>
              </div>
            </div>

            {/* Password Policy */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    value={appSettings?.security?.passwordPolicy?.minLength || 8}
                    onChange={(e) => handleNestedFeatureChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={saving}
                    min="4"
                    max="32"
                  />
                </div>
                
                <div className="p-6 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Password Requirements</h3>
                  <div className="space-y-3">
                    {Object.entries(appSettings?.security?.passwordPolicy || {}).map(([key, value]) => {
                      if (key === 'minLength') return null;
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleNestedFeatureChange('security', 'passwordPolicy', key, e.target.checked)}
                              className="sr-only peer"
                              disabled={saving}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Configuration */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Application Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Upload Size (MB)
                  </label>
                  <input
                    type="number"
                    value={appSettings?.appConfig?.maxFileUploadSize || 10}
                    onChange={(e) => handleFeatureChange('appConfig', 'maxFileUploadSize', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={saving}
                    min="1"
                    max="100"
                  />
                </div>
                
                <div className="p-6 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Auto Archive (days)
                  </label>
                  <input
                    type="number"
                    value={appSettings?.appConfig?.taskAutoArchiveDays || 90}
                    onChange={(e) => handleFeatureChange('appConfig', 'taskAutoArchiveDays', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={saving}
                    min="1"
                    max="365"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSettings;
