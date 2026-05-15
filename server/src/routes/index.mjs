import { Router } from 'express';
import { authRoutes } from './auth.routes.mjs';
import { employeeRoutes } from './employee.routes.mjs';
import { leaveRoutes } from './leave.routes.mjs';
import { attendanceRoutes } from './attendance.routes.mjs';
import { payrollRoutes } from './payroll.routes.mjs';
import { notificationRoutes } from './notification.routes.mjs';

export const apiRoutes = Router();

apiRoutes.get('/health', (_req, res) => res.json({ status: 'ok', service: 'enterprise-hrms' }));
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/employees', employeeRoutes);
apiRoutes.use('/leave', leaveRoutes);
apiRoutes.use('/attendance', attendanceRoutes);
apiRoutes.use('/payroll', payrollRoutes);
apiRoutes.use('/notifications', notificationRoutes);
