const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Reads the JWT from the httpOnly cookie and attaches the user to req.
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not logged in' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
};

// Usage: requireRole('business')
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have access to this' });
  }
  next();
};

module.exports = { protect, requireRole };
