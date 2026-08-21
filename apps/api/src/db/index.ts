import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type DatabaseInstance = ReturnType<typeof createDb>;

export function createDb(databaseUrl: string, maxConnections = 10) {
  const client = postgres(databaseUrl, {
    max: maxConnections,
    onnotice: () => {}, // Suppress noisy notices in logs
  });

  const db = drizzle(client, { schema });

  return {
    db,
    client,
    async close() {
      await client.end({ timeout: 5 });
    },
  };
}

export * from './schema/index.js';
