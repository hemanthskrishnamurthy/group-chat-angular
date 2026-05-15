import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Super Admin', 'HR', 'Manager', 'Employee'], default: 'Employee', index: true },
    refreshTokenHash: String,
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
