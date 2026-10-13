const jwt = require('jsonwebtoken');
const User = require('../models/User');

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const sendToken = (res, user, status = 200) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  res.cookie('token', token, cookieOptions());
  res.status(status).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
    },
  });
};

// POST /api/auth/register  (business users only)
exports.register = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const user = await User.create({ name, email, password, businessName, role: 'business' });
    sendToken(res, user, 201);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login  (business users and clients)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }
    sendToken(res, user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie('token', { ...cookieOptions(), maxAge: 0 });
  res.json({ message: 'Logged out' });
};

// GET /api/auth/me
exports.me = (req, res) => {
  const u = req.user;
  res.json({
    user: { id: u._id, name: u.name, email: u.email, role: u.role, businessName: u.businessName },
  });
};
