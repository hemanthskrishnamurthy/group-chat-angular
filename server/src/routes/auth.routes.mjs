import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.mjs';
import { validate } from '../middlewares/validate.middleware.mjs';
import { loginSchema, refreshSchema } from '../validators/auth.validator.mjs';
import * as controller from '../controllers/auth.controller.mjs';

export const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), controller.login);
authRoutes.post('/refresh', validate(refreshSchema), controller.refresh);
authRoutes.post('/logout', authenticate, controller.logout);
