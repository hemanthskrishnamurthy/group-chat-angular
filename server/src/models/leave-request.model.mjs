import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    type: { type: String, enum: ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: String,
    managerApproval: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: Date },
    hrApproval: { status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: Date },
    status: { type: String, enum: ['Pending Manager', 'Pending HR', 'Approved', 'Rejected'], default: 'Pending Manager', index: true },
  },
  { timestamps: true },
);

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
