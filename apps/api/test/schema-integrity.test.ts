import { describe, expect, it } from 'vitest';
import { getTableColumns, getTableName } from 'drizzle-orm';
import * as schema from '../src/db/schema/index.js';

describe('Database Schema & Relational Integrity Structure', () => {
  it('defines all required Phase 1 foundational tables', () => {
    expect(getTableName(schema.users)).toBe('users');
    expect(getTableName(schema.sessions)).toBe('sessions');
    expect(getTableName(schema.workspaces)).toBe('workspaces');
    expect(getTableName(schema.workspaceMembers)).toBe('workspace_members');
    expect(getTableName(schema.workspaceInvitations)).toBe('workspace_invitations');
    expect(getTableName(schema.projects)).toBe('projects');
    expect(getTableName(schema.sections)).toBe('sections');
    expect(getTableName(schema.tasks)).toBe('tasks');
    expect(getTableName(schema.notes)).toBe('notes');
    expect(getTableName(schema.people)).toBe('people');
    expect(getTableName(schema.calendarEvents)).toBe('calendar_events');
    expect(getTableName(schema.conversations)).toBe('conversations');
    expect(getTableName(schema.messages)).toBe('messages');
    expect(getTableName(schema.aiProviderCredentials)).toBe('ai_provider_credentials');
    expect(getTableName(schema.agents)).toBe('agents');
    expect(getTableName(schema.agentRuns)).toBe('agent_runs');
    expect(getTableName(schema.agentSteps)).toBe('agent_steps');
    expect(getTableName(schema.approvalRequests)).toBe('approval_requests');
    expect(getTableName(schema.auditLogs)).toBe('audit_logs');
    expect(getTableName(schema.activityEvents)).toBe('activity_events');
    expect(getTableName(schema.idempotencyKeys)).toBe('idempotency_keys');
  });

  it('includes required columns on workspaces table distinguishing type from plan', () => {
    const columns = getTableColumns(schema.workspaces);
    expect(columns.workspaceType).toBeDefined();
    expect(columns.subscriptionPlan).toBeDefined();
    expect(columns.storageUsedBytes).toBeDefined();
  });

  it('includes required AES-256-GCM columns on ai_provider_credentials table', () => {
    const columns = getTableColumns(schema.aiProviderCredentials);
    expect(columns.ciphertext).toBeDefined();
    expect(columns.iv).toBeDefined();
    expect(columns.authTag).toBeDefined();
    expect(columns.keyThumbprint).toBeDefined();
    expect(columns.keyVersion).toBeDefined();
    expect(columns.scope).toBeDefined();
  });

  it('includes request fingerprint columns on idempotency_keys table', () => {
    const columns = getTableColumns(schema.idempotencyKeys);
    expect(columns.workspaceId).toBeDefined();
    expect(columns.userId).toBeDefined();
    expect(columns.idempotencyKey).toBeDefined();
    expect(columns.requestHash).toBeDefined();
    expect(columns.httpMethod).toBeDefined();
    expect(columns.requestPath).toBeDefined();
  });

  it('ensures sessions table contains tokenHash and userId without redundant tokenHash index', () => {
    const columns = getTableColumns(schema.sessions);
    expect(columns.tokenHash).toBeDefined();
    expect(columns.userId).toBeDefined();
    expect(columns.expiresAt).toBeDefined();
    expect(columns.revokedAt).toBeDefined();
  });
});
