import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initSockets } from './sockets/index.js';
import { logger } from './config/logger.js';

const server = http.createServer(app);
initSockets(server);

server.listen(env.port, () => {
  logger.info(`API running on port ${env.port}`);
});
