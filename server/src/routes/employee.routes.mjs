import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middlewares/auth.middleware.mjs';
import { validate } from '../middlewares/validate.middleware.mjs';
import { employeeSchema } from '../validators/employee.validator.mjs';
import * as controller from '../controllers/employee.controller.mjs';

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

export const employeeRoutes = Router();

employeeRoutes.use(authenticate);
employeeRoutes.get('/', controller.listEmployees);
employeeRoutes.get('/:id', controller.getEmployee);
employeeRoutes.post('/', authorize('Super Admin', 'HR'), validate(employeeSchema), controller.createEmployee);
employeeRoutes.put('/:id', authorize('Super Admin', 'HR'), validate(employeeSchema), controller.updateEmployee);
employeeRoutes.delete('/:id', authorize('Super Admin'), controller.deleteEmployee);
employeeRoutes.post('/:id/documents', authorize('Super Admin', 'HR'), upload.single('document'), (req, res) => {
  res.status(201).json({ file: req.file, employeeId: req.params.id });
});
