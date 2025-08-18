const express = require('express');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', verifyToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.name}, your empId is ${req.user.empId}`,
    user: req.user
  });
});

module.exports = router;