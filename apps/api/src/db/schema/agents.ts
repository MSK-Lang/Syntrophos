import { foreignKey, index, jsonb, numeric, pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { uuidv7 } from '../../lib/uuidv7.js';
import { conversations } from './chat.js';
import { users } from './users.js';
import { workspaces } from './workspaces.js';

export const agents = pgTable(
  'agents',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 64 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    type: varchar('type', { length: 32 }).notNull().default('general'),
    status: varchar('status', { length: 32 }).notNull().default('available'),
    systemPrompt: text('system_prompt'),
    temperature: numeric('temperature', { precision: 3, scale: 2 }).notNull().default('0.70'),
    toolIds: text('tool_ids').array().notNull().default(sql`'{}'::text[]`),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    unique('uq_agents_workspace_id').on(table.workspaceId, table.id),
    index('idx_agents_workspace').on(table.workspaceId).where(sql`${table.deletedAt} IS NULL`),
  ],
);

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    agentId: uuid('agent_id').notNull(),
    conversationId: uuid('conversation_id'),
    taskTitle: varchar('task_title', { length: 512 }).notNull(),
    status: varchar('status', { length: 32 }).notNull().default('queued'),
    trigger: varchar('trigger', { length: 32 }).notNull().default('user'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    errorMessage: text('error_message'),
  },
  (table) => [
    unique('uq_agent_runs_workspace_id').on(table.workspaceId, table.id),
    // Composite foreign keys enforcing same-workspace relationships
    foreignKey({
      columns: [table.workspaceId, table.agentId],
      foreignColumns: [agents.workspaceId, agents.id],
      name: 'fk_agent_runs_workspace_agent',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.workspaceId, table.conversationId],
      foreignColumns: [conversations.workspaceId, conversations.id],
      name: 'fk_agent_runs_workspace_conversation',
    }).onDelete('set null'),
    index('idx_agent_runs_agent').on(table.agentId, table.startedAt),
    index('idx_agent_runs_workspace_status').on(table.workspaceId, table.status),
  ],
);

export const agentSteps = pgTable(
  'agent_steps',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    runId: uuid('run_id')
      .notNull()
      .references(() => agentRuns.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    status: varchar('status', { length: 32 }).notNull().default('pending'),
    detail: text('detail'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_agent_steps_run').on(table.runId),
  ],
);

export const approvalRequests = pgTable(
  'approval_requests',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    agentRunId: uuid('agent_run_id').notNull(),
    actionType: varchar('action_type', { length: 64 }).notNull(),
    payload: jsonb('payload').notNull(),
    status: varchar('status', { length: 32 }).notNull().default('pending'),
    requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
    respondedAt: timestamp('responded_at', { withTimezone: true }),
    respondedById: uuid('responded_by_id').references(() => users.id),
  },
  (table) => [
    // Composite foreign key enforcing same-workspace agent run relationship
    foreignKey({
      columns: [table.workspaceId, table.agentRunId],
      foreignColumns: [agentRuns.workspaceId, agentRuns.id],
      name: 'fk_approvals_workspace_agent_run',
    }).onDelete('cascade'),
    index('idx_approvals_workspace_status').on(table.workspaceId, table.status),
  ],
);

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type AgentRun = typeof agentRuns.$inferSelect;
export type NewAgentRun = typeof agentRuns.$inferInsert;
export type AgentStep = typeof agentSteps.$inferSelect;
export type NewAgentStep = typeof agentSteps.$inferInsert;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type NewApprovalRequest = typeof approvalRequests.$inferInsert;
