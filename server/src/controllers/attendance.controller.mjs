import { Attendance } from '../models/attendance.model.mjs';
import { asyncHandler } from '../utils/errors.mjs';

export const checkIn = asyncHandler(async (req, res) => {
  const now = new Date();
  const attendance = await Attendance.findOneAndUpdate(
    { employee: req.body.employee, date: new Date(now.toDateString()) },
    { employee: req.body.employee, date: new Date(now.toDateString()), checkIn: now, late: now.getHours() >= 10 },
    { upsert: true, new: true },
  );
  req.io?.emit('attendance:updated', attendance);
  res.status(201).json(attendance);
});

export const checkOut = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.body.attendanceId);
  attendance.checkOut = new Date();
  attendance.workMinutes = Math.max(0, Math.round((attendance.checkOut - attendance.checkIn) / 60000));
  await attendance.save();
  req.io?.emit('attendance:updated', attendance);
  res.json(attendance);
});

export const report = asyncHandler(async (req, res) => {
  res.json(await Attendance.find(req.query.employee ? { employee: req.query.employee } : {}).sort('-date').lean());
});
