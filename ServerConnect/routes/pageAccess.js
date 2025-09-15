const express = require('express');
const router = express.Router();
const {
  initializePageMaster,
  getAllPages,
  getUserAccessControl,
  updateUserPageAccess,
  getAllUsersAccessSummary,
  bulkUpdateUserAccess,
  checkUserPageAccess,
  getUserRoleEscalationInfo,
  updateUserRole
} = require('../controllers/pageAccessController');
const { getUserPageAccess } = require('../middleware/pageAccess');
const verifyToken = require('../middleware/verifyToken');

// Initialize page master on startup
initializePageMaster();

// Get all pages (admin only)
router.get('/pages', verifyToken, getAllPages);

// Get all users with access summary (admin only)
router.get('/users-summary', verifyToken, getAllUsersAccessSummary);

// Get user access control for specific user (admin only)
router.get('/user/:userId', verifyToken, getUserAccessControl);

// Update user page access (admin only)
router.put('/user/:userId', verifyToken, updateUserPageAccess);

// Bulk update user access (admin only)
router.put('/user/:userId/bulk', verifyToken, bulkUpdateUserAccess);

// Check if current user has access to specific page
router.get('/check/:pageId', verifyToken, checkUserPageAccess);

// Get current user's page access summary
router.get('/my-access', verifyToken, getUserPageAccess, (req, res) => {
  res.json({
    user: req.user,
    pageAccess: req.userPageAccess
  });
});

// Get role escalation information for a user (admin only)
router.get('/user/:userId/role-escalation', verifyToken, getUserRoleEscalationInfo);

// Update user role (admin only)
router.put('/user/:userId/role', verifyToken, updateUserRole);

module.exports = router;
