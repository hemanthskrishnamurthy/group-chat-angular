import { AuditLog } from '../models/audit-log.model.mjs';

export async function audit(req, action, entity, entityId, metadata = {}) {
  await AuditLog.create({
    actor: req.user?.id,
    action,
    entity,
    entityId,
    metadata,
    ipAddress: req.ip,
  });
}
