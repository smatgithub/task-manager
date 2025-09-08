const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function verifyToken(req, res, next) {
  try {
    console.log('verifyToken called for:', req.path);
    const header = req.headers.authorization || req.headers.Authorization || '';
    console.log('Auth header present:', !!header);
    
    if (!header.startsWith('Bearer ')) {
      console.log('Missing Bearer token');
      return res.status(401).json({ message: 'Missing Bearer token' });
    }
    const token = header.slice(7).trim();
    if (!token) {
      console.log('Empty token');
      return res.status(401).json({ message: 'Empty token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
    } catch (e) {
      console.log('Token verification failed:', e.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Resolve a user id from common claim names (token uses 'id' field)
    const claimedId = decoded.id || decoded._id || decoded.userId || null;
    console.log('Claimed ID:', claimedId);

    // Load fresh user to get empId/role safely
    const user = claimedId
      ? await User.findById(claimedId).select('_id name email empId role').lean()
      : await User.findOne({ email: decoded.email }).select('_id name email empId role').lean();

    console.log('Found user:', user ? user.name : 'not found');

    if (!user) return res.status(401).json({ message: 'User not found' });

    // For chat functionality, we don't require empId
    if (req.path.includes('/chat/') && !user.empId) {
      console.log('Chat route - empId not required');
      req.user = { 
        userId: String(user._id), 
        id: String(user._id),
        name: user.name, 
        email: user.email, 
        role: user.role 
      };
      return next();
    }

    // If your policy requires empId for protected APIs (like suggest)
    if (!user.empId) {
      console.log('empId required but not found');
      return res.status(403).json({ message: 'EmployeeId required' });
    }

    req.user = { 
      userId: String(user._id),
      id: String(user._id), 
      name: user.name, 
      email: user.email, 
      empId: user.empId, 
      role: user.role 
    };
    console.log('Token verification successful for user:', user.name);
    return next();
  } catch (err) {
    console.error('verifyToken error:', err);
    return res.status(500).json({ message: 'Auth middleware error' });
  }
};