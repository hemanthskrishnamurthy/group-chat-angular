import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['leave', 'payroll', 'attendance', 'announcement'], required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification = mongoose.model('Notification', notificationSchema);
