import { employeeService } from '../services/employee.service.mjs';
import { audit } from '../services/audit.service.mjs';
import { asyncHandler } from '../utils/errors.mjs';

export const listEmployees = asyncHandler(async (req, res) => {
  res.json(await employeeService.list(req.query));
});

export const getEmployee = asyncHandler(async (req, res) => {
  res.json(await employeeService.get(req.params.id));
});

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.create(req.body, req.user?.name);
  await audit(req, 'CREATE_EMPLOYEE', 'Employee', employee._id.toString());
  res.status(201).json(employee);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.update(req.params.id, req.body);
  await audit(req, 'UPDATE_EMPLOYEE', 'Employee', req.params.id, req.body);
  res.json(employee);
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  await employeeService.remove(req.params.id);
  await audit(req, 'DELETE_EMPLOYEE', 'Employee', req.params.id);
  res.status(204).send();
});
