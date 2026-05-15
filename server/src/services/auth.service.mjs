import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.mjs';
import { User } from '../models/user.model.mjs';
import { ApiError } from '../utils/errors.mjs';

function signTokens(user) {
  const payload = { id: user._id.toString(), email: user.email, role: user.role, name: user.name };
  return {
    accessToken: jwt.sign(payload, env.jwtSecret, { expiresIn: '15m' }),
    refreshToken: jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: '7d' }),
  };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const tokens = signTokens(user);
  user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  user.lastLoginAt = new Date();
  await user.save();

  return { id: user._id, name: user.name, email: user.email, role: user.role, ...tokens };
}

export async function refresh(refreshToken) {
  const payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  const user = await User.findById(payload.id);
  if (!user || !(await bcrypt.compare(refreshToken, user.refreshTokenHash ?? ''))) {
    throw new ApiError(401, 'Invalid refresh token');
  }
  return signTokens(user);
}
