const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config(); // fallback

const dns = require('dns');
// Set public DNS to resolve Atlas SRV records reliably
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');
try { dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']); } catch (e) {}

const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;
const SERVER_TIMEOUT = parseInt(process.env.SERVER_TIMEOUT, 10) || 600000; // 10 minutes

(async () => {
  // Attempt database connection
  try {
    await connectDB();
  } catch (err) {
    console.warn('⚠️ Starting HTTP & WebSocket server in standby mode while database reconnects...');
    // Schedule periodic reconnection
    const retryInterval = setInterval(async () => {
      try {
        if (mongoose.connection.readyState === 0) {
          console.log('🔄 Retrying MongoDB connection...');
          await connectDB();
          clearInterval(retryInterval);
        }
      } catch (retryErr) {
        // Suppress repeated stack trace during retry
      }
    }, 10000);
  }

  const server = http.createServer(app);

  // === Fix for "Upstream idle timeout exceeded" ===
  server.timeout = SERVER_TIMEOUT;
  server.keepAliveTimeout = SERVER_TIMEOUT;
  server.headersTimeout = SERVER_TIMEOUT + 10000;
  server.requestTimeout = SERVER_TIMEOUT;

  // Request timeout middleware: prevent hanging requests
  app.use((req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          error: 'Request timeout',
          message: 'The server took too long to respond. Please try again.',
        });
      }
    }, SERVER_TIMEOUT);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    next();
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: SERVER_TIMEOUT,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  initSocket(io);

  // Make io accessible in controllers
  app.set('io', io);

  server.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
})();
