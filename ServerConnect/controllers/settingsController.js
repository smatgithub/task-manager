const UserSettings = require('../models/UserSettings');
const AppSettings = require('../models/AppSettings');
const User = require('../models/User');

// User Settings Controllers

// Get user settings
const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let userSettings = await UserSettings.findOne({ userId }).populate('userId', 'name email role');
    
    if (!userSettings) {
      // Create default settings for new user
      userSettings = new UserSettings({
        userId,
        pageAccess: {
          dashboard: true,
          taskManagement: true,
          taskCreation: true,
          taskBoard: true,
          profileManagement: true,
          chatAccess: true,
          adminPages: req.user.role === 'admin' || req.user.role === 'hod',
          userManagement: req.user.role === 'admin'
        },
        preferences: {
          theme: 'auto',
          notifications: {
            email: true,
            push: true,
            taskUpdates: true,
            chatMessages: true
          },
          language: 'en'
        }
      });
      await userSettings.save();
    }
    
    res.json(userSettings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
};

// Update user settings
const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pageAccess, preferences } = req.body;
    
    const userSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { 
        pageAccess: { ...pageAccess },
        preferences: { ...preferences }
      },
      { new: true, upsert: true }
    ).populate('userId', 'name email role');
    
    res.json(userSettings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
};

// Admin Settings Controllers

// Get application settings (admin only)
const getAppSettings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    let appSettings = await AppSettings.findOne();
    
    if (!appSettings) {
      // Create default app settings
      appSettings = new AppSettings({
        lastUpdatedBy: req.user.id,
        features: {
          chatEnabled: true,
          taskCreationEnabled: true,
          userRegistrationEnabled: true,
          oauthEnabled: {
            google: true,
            microsoft: true
          },
          maintenanceMode: {
            enabled: false,
            message: 'Application is currently under maintenance. Please try again later.'
          }
        },
        security: {
          sessionTimeout: 480,
          maxLoginAttempts: 5,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          }
        },
        appConfig: {
          maxFileUploadSize: 10,
          allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'],
          taskAutoArchiveDays: 90,
          chatMessageRetentionDays: 365
        }
      });
      await appSettings.save();
    }
    
    res.json(appSettings);
  } catch (error) {
    console.error('Error fetching app settings:', error);
    res.status(500).json({ error: 'Failed to fetch app settings' });
  }
};

// Update application settings (admin only)
const updateAppSettings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    const { features, security, appConfig } = req.body;
    
    const appSettings = await AppSettings.findOneAndUpdate(
      {},
      { 
        features: { ...features },
        security: { ...security },
        appConfig: { ...appConfig },
        lastUpdatedBy: req.user.id
      },
      { new: true, upsert: true }
    ).populate('lastUpdatedBy', 'name email');
    
    res.json(appSettings);
  } catch (error) {
    console.error('Error updating app settings:', error);
    res.status(500).json({ error: 'Failed to update app settings' });
  }
};

// Get all users with their settings (admin only)
const getAllUsersSettings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    const users = await User.find({}, 'name email role department createdAt');
    const usersWithSettings = await Promise.all(
      users.map(async (user) => {
        const settings = await UserSettings.findOne({ userId: user._id });
        return {
          ...user.toObject(),
          settings: settings || null
        };
      })
    );
    
    res.json(usersWithSettings);
  } catch (error) {
    console.error('Error fetching all users settings:', error);
    res.status(500).json({ error: 'Failed to fetch users settings' });
  }
};

// Update specific user settings (admin only)
const updateUserSettingsByAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    const { userId } = req.params;
    const { pageAccess, preferences } = req.body;
    
    const userSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { 
        pageAccess: { ...pageAccess },
        preferences: { ...preferences }
      },
      { new: true, upsert: true }
    ).populate('userId', 'name email role');
    
    res.json(userSettings);
  } catch (error) {
    console.error('Error updating user settings by admin:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
};

// Check if feature is enabled
const checkFeatureEnabled = async (req, res) => {
  try {
    const { feature } = req.params;
    
    const appSettings = await AppSettings.findOne();
    if (!appSettings) {
      return res.json({ enabled: true }); // Default to enabled if no settings
    }
    
    let enabled = true;
    switch (feature) {
      case 'chat':
        enabled = appSettings.features.chatEnabled;
        break;
      case 'task-creation':
        enabled = appSettings.features.taskCreationEnabled;
        break;
      case 'user-registration':
        enabled = appSettings.features.userRegistrationEnabled;
        break;
      case 'maintenance':
        enabled = appSettings.features.maintenanceMode.enabled;
        break;
      default:
        enabled = true;
    }
    
    res.json({ enabled });
  } catch (error) {
    console.error('Error checking feature status:', error);
    res.status(500).json({ error: 'Failed to check feature status' });
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  getAppSettings,
  updateAppSettings,
  getAllUsersSettings,
  updateUserSettingsByAdmin,
  checkFeatureEnabled
};
