const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  const { name, email, password, role, authorityId } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: role === 'admin' ? 'admin' : 'citizen',
    authorityId: authorityId || null,
  });

  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      authorityId: user.authorityId,
      points: user.points || 0,
      badges: user.badges || [],
    },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      authorityId: user.authorityId,
      points: user.points || 0,
      badges: user.badges || [],
    },
  });
};

exports.me = async (req, res) => {
  res.json({ success: true, user: req.user });
};
