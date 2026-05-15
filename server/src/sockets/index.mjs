import jwt from 'jsonwebtoken';
import { env } from '../config/env.mjs';
import { logger } from '../utils/logger.mjs';

export function registerSockets(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next();
    }
    try {
      socket.user = jwt.verify(token, env.jwtSecret);
      return next();
    } catch {
      return next(new Error('Invalid socket token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id, user: socket.user?.id });
    socket.on('disconnect', () => logger.info('Socket disconnected', { socketId: socket.id }));
  });
}
