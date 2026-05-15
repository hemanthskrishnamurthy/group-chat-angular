import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.mjs';
import { Notification } from '../models/notification.model.mjs';

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);
notificationRoutes.get('/', async (req, res) => {
  res.json(await Notification.find({ $or: [{ recipient: req.user.id }, { recipient: null }] }).sort('-createdAt').lean());
});
