const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initSocket = (io) => {
  // Authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Socket connected: ${user.email} (${user.role})`);

    // Each user joins their own private room for direct events
    socket.join(`user:${user._id}`);
    if (user.role === 'admin') socket.join('admins');

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.email}`);
    });
  });
};

module.exports = initSocket;