import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true },
);

export const Department = mongoose.model('Department', departmentSchema);
