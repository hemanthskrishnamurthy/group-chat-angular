import jwt from 'jsonwebtoken';
import { env } from '../config/env.mjs';
import { ApiError } from '../utils/errors.mjs';

export function authenticate(req, _res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    return next();
  };
}
