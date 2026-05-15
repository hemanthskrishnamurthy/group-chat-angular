import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true, index: true },
    checkIn: Date,
    checkOut: Date,
    source: { type: String, enum: ['Web', 'Biometric'], default: 'Web' },
    late: { type: Boolean, default: false },
    workMinutes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
