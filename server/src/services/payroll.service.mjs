import { Payroll } from '../models/payroll.model.mjs';
import { Employee } from '../models/employee.model.mjs';

export async function processPayroll({ month, year, processedBy }) {
  const employees = await Employee.find({ status: { $ne: 'Inactive' } });
  const operations = employees.map((employee) => {
    const grossSalary = employee.salary / 12;
    const bonuses = grossSalary * 0.05;
    const deductions = grossSalary * 0.02;
    const tax = grossSalary * 0.1;
    const netSalary = grossSalary + bonuses - deductions - tax;
    return Payroll.findOneAndUpdate(
      { employee: employee._id, month, year },
      { employee: employee._id, month, year, grossSalary, bonuses, deductions, tax, netSalary, processedBy, processedAt: new Date() },
      { upsert: true, new: true },
    );
  });
  return Promise.all(operations);
}
