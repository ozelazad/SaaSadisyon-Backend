import { logger } from '../config/logger.js';

export function errorHandler(err, _req, res, _next) {
  logger.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
}
