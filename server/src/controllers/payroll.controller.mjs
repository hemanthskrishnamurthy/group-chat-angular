import { Payroll } from '../models/payroll.model.mjs';
import { Employee } from '../models/employee.model.mjs';
import { processPayroll } from '../services/payroll.service.mjs';
import { createPayslipPdf } from '../utils/pdf.mjs';
import { asyncHandler } from '../utils/errors.mjs';

export const process = asyncHandler(async (req, res) => {
  const payrolls = await processPayroll({ month: req.body.month, year: req.body.year, processedBy: req.user.id });
  req.io?.emit('notification:new', { type: 'payroll', title: 'Payroll processed' });
  res.status(201).json({ processed: payrolls.length });
});

export const payslip = asyncHandler(async (req, res) => {
  const payroll = req.params.id === 'demo' ? null : await Payroll.findById(req.params.id).lean();
  const employee = payroll ? await Employee.findById(payroll.employee).lean() : null;
  const pdf = await createPayslipPdf(payroll, employee);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=payslip.pdf');
  res.send(pdf);
});
