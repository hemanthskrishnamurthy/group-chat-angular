import { logger } from '../utils/logger.mjs';

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  logger.error(error.message, { stack: error.stack });
  res.status(error.statusCode ?? 500).json({ message: error.message ?? 'Internal server error' });
}
