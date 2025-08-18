const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing Bearer token' });
    }
    const token = header.slice(7).trim();
    if (!token) return res.status(401).json({ message: 'Empty token' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      // decoded might look like: { id: "...", email: "...", iat:..., exp:... }
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Resolve a user id from common claim names
    const claimedId = decoded.id || decoded._id || decoded.userId || null;

    // Load fresh user to get empId/role safely
    const user = claimedId
      ? await User.findById(claimedId).select('_id name email empId role').lean()
      : await User.findOne({ email: decoded.email }).select('_id name email empId role').lean();

    if (!user) return res.status(401).json({ message: 'User not found' });

    // If your policy requires empId for protected APIs (like suggest)
    if (!user.empId) return res.status(403).json({ message: 'EmployeeId required' });

    req.user = { id: String(user._id), name: user.name, email: user.email, empId: user.empId, role: user.role };
    return next();
  } catch (err) {
    console.error('verifyToken error:', err);
    return res.status(500).json({ message: 'Auth middleware error' });
  }
};