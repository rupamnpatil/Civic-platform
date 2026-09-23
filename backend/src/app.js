require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authorityRoutes = require('./routes/authorityRoutes');
const userRoutes = require('./routes/userRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) =>
  res.json({ status: 'ok', service: 'Civic Maintenance Platform API' })
);

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