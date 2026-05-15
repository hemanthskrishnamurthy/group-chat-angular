import express from 'express';
import { securityMiddleware } from './middlewares/security.middleware.mjs';
import { apiRoutes } from './routes/index.mjs';
import { errorHandler, notFound } from './middlewares/error.middleware.mjs';

export function createApp(io) {
  const app = express();
  app.use(securityMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use((req, _res, next) => {
    req.io = io;
    next();
  });
  app.use('/api', apiRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
