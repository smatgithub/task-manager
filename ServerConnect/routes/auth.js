const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, empId, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPwd = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPwd,
      empId,
      role,
      authProvider: 'local'
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
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

    res.json({ token, user: { name: user.name, email: user.email, role: user.role, empId: user.empId } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
