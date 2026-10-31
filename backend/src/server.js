require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;
const SERVER_TIMEOUT = parseInt(process.env.SERVER_TIMEOUT, 10) || 600000; // 10 minutes

(async () => {
  await connectDB();

  const server = http.createServer(app);

  // === Fix for "Upstream idle timeout exceeded" ===
  // Set server-level timeout to keep connections alive longer
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
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
    // Socket.io ping timeout settings to prevent idle disconnects
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