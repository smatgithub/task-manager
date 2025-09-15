const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PageMaster = require('../models/PageMaster');
const UserPageAccess = require('../models/UserPageAccess');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, empId, role, department } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Force role to 'user' for new registrations - no role selection allowed
    const userRole = 'user';

    const hashedPwd = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPwd,
      empId,
      role: userRole, // Always 'user' for new registrations
      department,
      authProvider: 'local'
    });

    await user.save();

    // Create page access records for system pages
    try {
      const systemPages = await PageMaster.find({ 
        isSystemPage: true, 
        isActive: true 
      }).select('pageId');

      const accessRecords = systemPages.map(page => ({
        userId: user._id,
        pageId: page.pageId,
        hasAccess: true, // Grant access to system pages by default
        grantedBy: user._id, // Self-granted during registration
        grantedAt: new Date(),
        notes: 'Auto-granted during user registration'
      }));

      if (accessRecords.length > 0) {
        await UserPageAccess.insertMany(accessRecords);
        console.log(`Created ${accessRecords.length} page access records for user ${user.email}`);
      }
    } catch (accessError) {
      console.error('Error creating page access records:', accessError);
      // Don't fail registration if page access creation fails
    }

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        empId: user.empId,
        department: user.department
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.authProvider !== 'local')
      return res.status(400).json({ message: 'Invalid credentials or login method' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    // const token = jwt.sign(
    //   { id: user._id, role: user.role, empId: user.empId },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '1d' }
    // );
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        empId: user.empId || null,
        accessLevel: user.empId ? 'full' : 'restricted'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { _id: user._id, id: user._id, name: user.name, email: user.email, role: user.role, empId: user.empId } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
