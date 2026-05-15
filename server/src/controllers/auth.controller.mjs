import { asyncHandler } from '../utils/errors.mjs';
import * as authService from '../services/auth.service.mjs';
import { audit } from '../services/audit.service.mjs';

export const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.body);
  req.user = session;
  await audit(req, 'LOGIN', 'User', session.id);
  res.json(session);
});

export const refresh = asyncHandler(async (req, res) => {
  res.json(await authService.refresh(req.body.refreshToken));
});

export const logout = asyncHandler(async (req, res) => {
  await audit(req, 'LOGOUT', 'User', req.user?.id);
  res.status(204).send();
});
