import { LeaveRequest } from '../models/leave-request.model.mjs';
import { Notification } from '../models/notification.model.mjs';
import { audit } from '../services/audit.service.mjs';
import { asyncHandler } from '../utils/errors.mjs';

export const applyLeave = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.create(req.body);
  req.io?.emit('leave:updated', leave);
  await audit(req, 'APPLY_LEAVE', 'LeaveRequest', leave._id.toString());
  res.status(201).json(leave);
});

export const approveLeave = asyncHandler(async (req, res) => {
  const isManager = req.user.role === 'Manager';
  const nextStatus = req.body.decision === 'Rejected' ? 'Rejected' : isManager ? 'Pending HR' : 'Approved';
  const update = isManager
    ? { managerApproval: { status: req.body.decision, approvedBy: req.user.id, at: new Date() }, status: nextStatus }
    : { hrApproval: { status: req.body.decision, approvedBy: req.user.id, at: new Date() }, status: nextStatus };
  const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, update, { new: true });
  await Notification.create({ title: 'Leave status updated', message: `Leave request is ${nextStatus}`, type: 'leave' });
  req.io?.emit('leave:updated', leave);
  await audit(req, 'APPROVE_LEAVE', 'LeaveRequest', req.params.id, update);
  res.json(leave);
});

export const leaveHistory = asyncHandler(async (_req, res) => {
  res.json(await LeaveRequest.find().sort('-createdAt').populate('employee').lean());
});
