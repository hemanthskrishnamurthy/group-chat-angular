import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: String,
    metadata: mongoose.Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: true },
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
