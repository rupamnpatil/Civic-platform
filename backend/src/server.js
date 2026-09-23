require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  initSocket(io);

  // Make io accessible in controllers
  app.set('io', io);

  server.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
})();