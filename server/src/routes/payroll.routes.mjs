import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.mjs';
import * as controller from '../controllers/payroll.controller.mjs';

export const payrollRoutes = Router();

payrollRoutes.get('/payslip/:id', controller.payslip);
payrollRoutes.use(authenticate, authorize('Super Admin', 'HR'));
payrollRoutes.post('/process', controller.process);
