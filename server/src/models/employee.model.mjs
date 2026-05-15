import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const employeeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employeeId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: String,
    department: { type: String, required: true, index: true },
    designation: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    salary: { type: Number, required: true },
    address: String,
    emergencyContact: String,
    profileImageUrl: String,
    documents: [documentSchema],
    status: { type: String, enum: ['Onboarding', 'Active', 'On Leave', 'Inactive'], default: 'Onboarding', index: true },
    timeline: [{ action: String, actor: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true },
);

employeeSchema.index({ name: 'text', email: 'text', employeeId: 'text', department: 'text', designation: 'text' });

export const Employee = mongoose.model('Employee', employeeSchema);
