import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.mjs';
import { validate } from '../middlewares/validate.middleware.mjs';
import { leaveApplySchema, leaveApprovalSchema } from '../validators/leave.validator.mjs';
import * as controller from '../controllers/leave.controller.mjs';

export const leaveRoutes = Router();

leaveRoutes.use(authenticate);
leaveRoutes.post('/apply', validate(leaveApplySchema), controller.applyLeave);
leaveRoutes.put('/approve/:id', authorize('Manager', 'HR', 'Super Admin'), validate(leaveApprovalSchema), controller.approveLeave);
leaveRoutes.get('/history', controller.leaveHistory);
