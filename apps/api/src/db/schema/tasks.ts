import { type AnyPgColumn, foreignKey, index, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { uuidv7 } from '../../lib/uuidv7.js';
import { projects, sections } from './projects.js';
import { users } from './users.js';
import { workspaces } from './workspaces.js';

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id'),
    sectionId: uuid('section_id').references(() => sections.id, { onDelete: 'set null' }),
    parentTaskId: uuid('parent_task_id').references((): AnyPgColumn => tasks.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 512 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 32 }).notNull().default('todo'),
    priority: varchar('priority', { length: 32 }).notNull().default('medium'),
    dueDate: timestamp('due_date', { withTimezone: true }),
    dueTime: varchar('due_time', { length: 16 }),
    estimatedMinutes: integer('estimated_minutes'),
    actualMinutes: integer('actual_minutes'),
    recurrenceRule: jsonb('recurrence_rule'),
    tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
    orderIndex: integer('order_index').notNull().default(0),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    completedById: uuid('completed_by_id').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Composite foreign key enforcing same-workspace project relationship
    foreignKey({
      columns: [table.workspaceId, table.projectId],
      foreignColumns: [projects.workspaceId, projects.id],
      name: 'fk_tasks_workspace_project',
    }).onDelete('set null'),
    index('idx_tasks_workspace_status').on(table.workspaceId, table.status).where(sql`${table.deletedAt} IS NULL`),
    index('idx_tasks_project').on(table.projectId).where(sql`${table.deletedAt} IS NULL`),
    index('idx_tasks_due').on(table.workspaceId, table.dueDate).where(sql`${table.status} != 'done' AND ${table.deletedAt} IS NULL`),
  ],
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
