import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { uuidv7 } from '../../lib/uuidv7.js';
import { users } from './users.js';
import { workspaces } from './workspaces.js';

export const aiProviderCredentials = pgTable(
  'ai_provider_credentials',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    providerId: varchar('provider_id', { length: 64 }).notNull(), // 'openai', 'anthropic', 'gemini', 'openrouter'
    scope: varchar('scope', { length: 32 }).notNull().default('workspace'), // 'workspace' | 'user'
    label: varchar('label', { length: 128 }).notNull().default('Default Key'),
    ciphertext: text('ciphertext').notNull(),
    iv: varchar('iv', { length: 64 }).notNull(),
    authTag: varchar('auth_tag', { length: 64 }).notNull(),
    keyThumbprint: varchar('key_thumbprint', { length: 64 }).notNull(),
    keyVersion: integer('key_version').notNull().default(1),
    isDefault: boolean('is_default').notNull().default(true),
    status: varchar('status', { length: 32 }).notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_byok_workspace_provider').on(table.workspaceId, table.providerId),
  ],
);

export type AiProviderCredential = typeof aiProviderCredentials.$inferSelect;
export type NewAiProviderCredential = typeof aiProviderCredentials.$inferInsert;
