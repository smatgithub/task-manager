const AppSettings = require('../models/AppSettings');

// Middleware to check if a feature is enabled
const checkFeatureAccess = (feature) => {
  return async (req, res, next) => {
    try {
      const appSettings = await AppSettings.findOne();
      
      if (!appSettings) {
        // If no settings found, allow access by default
        return next();
      }

      let featureEnabled = true;
      
      switch (feature) {
        case 'chat':
          featureEnabled = appSettings.features.chatEnabled;
          break;
        case 'task-creation':
          featureEnabled = appSettings.features.taskCreationEnabled;
          break;
        case 'user-registration':
          featureEnabled = appSettings.features.userRegistrationEnabled;
          break;
        case 'maintenance':
          featureEnabled = appSettings.features.maintenanceMode.enabled;
          break;
        default:
          featureEnabled = true;
      }

      if (!featureEnabled) {
        return res.status(403).json({ 
          error: 'Feature disabled',
          message: `The ${feature} feature is currently disabled by administrator.`
        });
      }

      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      // Allow access by default if there's an error
      next();
    }
  };
};

// Middleware to check maintenance mode
const checkMaintenanceMode = async (req, res, next) => {
  try {
    const appSettings = await AppSettings.findOne();
    
    if (appSettings && appSettings.features.maintenanceMode.enabled) {
      // Allow admin users to bypass maintenance mode
      if (req.user && req.user.role === 'admin') {
        return next();
      }
      
      return res.status(503).json({
        error: 'Maintenance Mode',
        message: appSettings.features.maintenanceMode.message || 'Application is currently under maintenance. Please try again later.'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    next();
  }
};

module.exports = {
  checkFeatureAccess,
  checkMaintenanceMode
};
