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

// Get all users (Admin/HOD only)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Check if user has admin or hod role
    if (!['admin', 'hod'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Admin or HOD role required.' });
    }

    console.log('Fetching all users for:', req.user.email);
    
    const users = await User.find()
      .select('name email empId role department authProvider createdAt')
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found users:', users.length);

    const data = users.map(u => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      empId: u.empId ?? null,
      role: u.role,
      department: u.department || '',
      authProvider: u.authProvider || 'local',
      createdAt: u.createdAt
    }));

    return res.json({ users: data });
  } catch (err) {
    console.error('GET /users error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user role (Admin only)
router.put('/:userId/role', verifyToken, async (req, res) => {
  try {
    // Only admin can change roles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'hod', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be user, hod, or admin.' });
    }

    console.log('Updating user role:', userId, 'to', role);

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: 'name email empId role department' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User role updated successfully:', user);

    return res.json({ 
      message: 'User role updated successfully',
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        empId: user.empId,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error('PUT /users/:userId/role error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile (Admin/HOD can update any user, users can update themselves)
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, department } = req.body;

    // Check if user can update this profile
    const canUpdate = req.user.role === 'admin' || 
                     req.user.role === 'hod' || 
                     String(req.user.id) === userId;

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Updating user profile:', userId);

    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: 'name email empId role department' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User profile updated successfully:', user);

    return res.json({ 
      message: 'User profile updated successfully',
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        empId: user.empId,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error('PUT /users/:userId error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete user (Admin only)
router.delete('/:userId', verifyToken, async (req, res) => {
  try {
    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (String(req.user.id) === userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    console.log('Deleting user:', userId);

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User deleted successfully:', user.email);

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('DELETE /users/:userId error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
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