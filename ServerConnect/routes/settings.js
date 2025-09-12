const express = require('express');
const router = express.Router();
const {
  getUserSettings,
  updateUserSettings,
  getAppSettings,
  updateAppSettings,
  getAllUsersSettings,
  updateUserSettingsByAdmin,
  checkFeatureEnabled
} = require('../controllers/settingsController');
const verifyToken = require('../middleware/verifyToken');

// User Settings Routes
router.get('/user', verifyToken, getUserSettings);
router.put('/user', verifyToken, updateUserSettings);

// Admin Settings Routes
router.get('/app', verifyToken, getAppSettings);
router.put('/app', verifyToken, updateAppSettings);
router.get('/users', verifyToken, getAllUsersSettings);
router.put('/users/:userId', verifyToken, updateUserSettingsByAdmin);

// Feature Check Route (public)
router.get('/feature/:feature', checkFeatureEnabled);

module.exports = router;
