import { Server } from 'socket.io';
import { logger } from '../config/logger.js';

let socketIO;

function initSockets(httpServer) {
  const allowedOrigins = (process.env.FRONTEND_ORIGIN || '*')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  socketIO = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
      credentials: true,
    },
  });

  socketIO.use((socket, next) => {
    const customerId = socket.handshake.auth?.customer_id;
    if (!customerId) return next(new Error('Missing tenant'));
    socket.join(`customer_${customerId}`);
    socket.data.customer_id = customerId;
    next();
  });

  socketIO.on('connection', (socket) => {
    logger.info({ id: socket.id }, 'socket connected');
    socket.on('disconnect', () => logger.info({ id: socket.id }, 'socket disconnected'));
  });

  return socketIO;
}

export { socketIO, initSockets };
