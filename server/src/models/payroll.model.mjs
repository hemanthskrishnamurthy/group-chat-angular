import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    grossSalary: Number,
    bonuses: Number,
    deductions: Number,
    tax: Number,
    netSalary: Number,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,
  },
  { timestamps: true },
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export const Payroll = mongoose.model('Payroll', payrollSchema);
