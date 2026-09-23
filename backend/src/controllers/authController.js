const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  const { name, email, password, role, authorityId } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }
  const user = await User.create({
    name,
    email,
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
      name: user.name,
      email: user.email,
      role: user.role,
      authorityId: user.authorityId,
    },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      authorityId: user.authorityId,
    },
  });
};

exports.me = async (req, res) => {
  res.json({ success: true, user: req.user });
};