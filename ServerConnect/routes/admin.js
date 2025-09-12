const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');

// Middleware to check if user is admin or HOD
const requireAdminOrHOD = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'hod') {
    return res.status(403).json({ error: 'Access denied. Admin or HOD role required.' });
  }
  next();
};

// Apply authentication and role check to all admin routes
router.use(verifyToken);
router.use(requireAdminOrHOD);

// Get all employees
router.get('/employees', adminController.getEmployees);

// Get performance metrics for selected employee
router.get('/performance-metrics/:empId', adminController.getPerformanceMetrics);

// Get weekly score data for selected employee
router.get('/score-data/:empId', adminController.getScoreData);

// Get daily tasks for selected employee
router.get('/daily-tasks/:empId', adminController.getDailyTasks);

// Get OTD tasks for selected employee
router.get('/otd-tasks/:empId', adminController.getOtdTasks);

// Get delegation tasks for selected employee
router.get('/delegation-tasks/:empId', adminController.getDelegationTasks);

module.exports = router;
