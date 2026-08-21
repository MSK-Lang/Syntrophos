import { boolean, foreignKey, index, integer, jsonb, pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { uuidv7 } from '../../lib/uuidv7.js';
import { users } from './users.js';
import { workspaces } from './workspaces.js';

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull().default('New Conversation'),
    providerId: varchar('provider_id', { length: 64 }),
    modelId: varchar('model_id', { length: 128 }),
    pinned: boolean('pinned').notNull().default(false),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    unique('uq_conversations_workspace_id').on(table.workspaceId, table.id),
    index('idx_conversations_workspace').on(table.workspaceId).where(sql`${table.deletedAt} IS NULL`),
  ],
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    conversationId: uuid('conversation_id').notNull(),
    role: varchar('role', { length: 32 }).notNull(), // 'user' | 'assistant' | 'system' | 'tool'
    content: text('content').notNull(),
    tokensUsed: integer('tokens_used'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Composite foreign key enforcing same-workspace conversation relationship
    foreignKey({
      columns: [table.workspaceId, table.conversationId],
      foreignColumns: [conversations.workspaceId, conversations.id],
      name: 'fk_messages_workspace_conversation',
    }).onDelete('cascade'),
    index('idx_messages_conversation').on(table.conversationId, table.createdAt),
  ],
);

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
