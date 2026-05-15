import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.mjs';

function sanitizeObject(value) {
  if (!value || typeof value !== 'object') {
    return;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
      continue;
    }
    sanitizeObject(value[key]);
  }
}

function inputSanitizer(req, _res, next) {
  sanitizeObject(req.body);
  sanitizeObject(req.params);
  sanitizeObject(req.query);
  next();
}

export const securityMiddleware = [
  helmet(),
  cors({ origin: env.corsOrigin, credentials: true }),
  compression(),
  inputSanitizer,
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }),
];
