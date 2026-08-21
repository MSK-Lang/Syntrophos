import { auditLogs } from '../db/schema/observability.js';
import type { DatabaseInstance } from '../db/index.js';

export interface RecordAuditEventParams {
  workspaceId: string;
  actorType: 'user' | 'agent' | 'system' | 'workflow';
  actorId: string;
  eventCategory: 'auth' | 'security' | 'workspace' | 'membership' | 'invitation';
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export async function recordAuditEvent(
  dbInstance: DatabaseInstance | undefined,
  params: RecordAuditEventParams,
): Promise<void> {
  if (!dbInstance) {
    return;
  }

  try {
    await dbInstance.db.insert(auditLogs).values({
      workspaceId: params.workspaceId,
      actorType: params.actorType,
      actorId: params.actorId,
      eventCategory: params.eventCategory,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      ipAddress: params.ipAddress,
      metadata: params.metadata,
    });
  } catch (err) {
    // Non-blocking for primary request flow, but logged for diagnostics
    console.error('Failed to record security audit log:', err);
  }
}
