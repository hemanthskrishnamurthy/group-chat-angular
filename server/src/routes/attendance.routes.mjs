import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.mjs';
import * as controller from '../controllers/attendance.controller.mjs';

export const attendanceRoutes = Router();

attendanceRoutes.use(authenticate);
attendanceRoutes.post('/checkin', controller.checkIn);
attendanceRoutes.post('/checkout', controller.checkOut);
attendanceRoutes.get('/report', controller.report);
