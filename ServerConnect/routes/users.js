const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ correct import: your middleware file is middleware/verifyToken.js
const verifyToken = require('../middleware/verifyToken');

// helper to escape regex meta
const reEscape = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/suggest', verifyToken, async (req, res) => {
  console.log('HIT /api/users/suggest', req.query);
  console.log('User:', req.user);
  try {
    if (!req.user?.empId) {
      console.log('No empId found for user:', req.user);
      return res.status(403).json({ message: 'EmployeeId required' });
    }

    const q = (req.query.q || '').trim();
    const limitRaw = parseInt(req.query.limit || '10', 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 10;

    console.log('Search query:', q, 'Limit:', limit);

    const filter = {};
    if (q) {
      const esc = reEscape(q);
      const num = Number(q);
      filter.$or = [
        { name:  { $regex: esc, $options: 'i' } },
        { email: { $regex: esc, $options: 'i' } },
        ...(Number.isFinite(num) ? [{ empId: num }] : []),
      ];
    }

    console.log('MongoDB filter:', filter);

    const users = await User.find(filter)
      .select('name email empId role')
      .sort({ name: 1 })
      .limit(limit)
      .lean();

    console.log('Found users:', users.length);

    const data = users.map(u => ({
      id: String(u._id),              // ✅ ensure string id for frontend
      name: u.name,
      email: u.email,
      empId: u.empId ?? null,
      role: u.role,
      label: u.empId ? `${u.name} (${u.empId})` : u.name,
    }));

    console.log('Returning data:', data);
    return res.json({ data });
  } catch (err) {
    console.error('GET /users/suggest error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint to check database connection and user data
router.get('/test', verifyToken, async (req, res) => {
  try {
    console.log('Testing database connection...');
    const totalUsers = await User.countDocuments();
    const sampleUsers = await User.find().select('name email empId role').limit(5).lean();
    
    console.log('Total users in database:', totalUsers);
    console.log('Sample users:', sampleUsers);
    
    return res.json({ 
      totalUsers, 
      sampleUsers,
      message: 'Database connection successful' 
    });
  } catch (err) {
    console.error('Database test error:', err);
    return res.status(500).json({ message: 'Database test failed', error: err.message });
  }
});

module.exports = router;