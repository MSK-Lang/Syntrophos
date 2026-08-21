import { index, jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { uuidv7 } from '../../lib/uuidv7.js';
import { workspaces } from './workspaces.js';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    actorType: varchar('actor_type', { length: 32 }).notNull(), // 'user' | 'agent' | 'system' | 'workflow'
    actorId: uuid('actor_id').notNull(),                        // Polymorphic ID
    eventCategory: varchar('event_category', { length: 64 }).notNull(), // 'auth', 'security', 'data_deletion', 'permission_change'
    action: varchar('action', { length: 128 }).notNull(),
    resourceType: varchar('resource_type', { length: 64 }).notNull(),
    resourceId: uuid('resource_id').notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_logs_workspace_time').on(table.workspaceId, table.createdAt),
  ],
);

export const activityEvents = pgTable(
  'activity_events',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    actorType: varchar('actor_type', { length: 32 }).notNull(), // 'user' | 'agent' | 'workflow' | 'system'
    actorId: uuid('actor_id').notNull(),                        // Polymorphic ID
    action: varchar('action', { length: 128 }).notNull(),
    resourceType: varchar('resource_type', { length: 64 }).notNull(),
    resourceId: uuid('resource_id').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_activity_events_workspace_time').on(table.workspaceId, table.createdAt),
  ],
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type ActivityEvent = typeof activityEvents.$inferSelect;
export type NewActivityEvent = typeof activityEvents.$inferInsert;
