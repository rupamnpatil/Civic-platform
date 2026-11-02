require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authorityRoutes = require('./routes/authorityRoutes');
const userRoutes = require('./routes/userRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow any local development origin (localhost, 127.0.0.1, LAN IPs)
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(
          origin
        ) ||
        process.env.CLIENT_URL === '*' ||
        !process.env.CLIENT_URL ||
        origin === process.env.CLIENT_URL
      ) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) =>
  res.json({
    status: 'ok',
    service: 'Civic Maintenance Platform API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
);

// Graceful check for DB readiness before handling /api routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        'Database connection unavailable. Please check if your MongoDB Atlas cluster is running (not paused) and allows IP 0.0.0.0/0.',
    });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/authorities', authorityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);

app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

app.use(errorHandler);

module.exports = app;
