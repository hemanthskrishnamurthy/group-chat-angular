import { EmployeeRepository } from '../repositories/employee.repository.mjs';

const employees = new EmployeeRepository();

export const employeeService = {
  list: (query) => employees.list(query),
  get: (id) => employees.findById(id),
  create: (payload, actor = 'system') =>
    employees.create({ ...payload, timeline: [{ action: 'Employee onboarded', actor }] }),
  update: (id, payload) => employees.update(id, payload),
  remove: (id) => employees.remove(id),
};
