import type { FastifyPluginAsync } from 'fastify';
import { sql } from 'drizzle-orm';
import type { DatabaseInstance } from '../db/index.js';

export interface HealthCheckResponse {
  readonly status: 'ok' | 'degraded';
  readonly version: string;
  readonly uptimeSeconds: number;
  readonly timestamp: string;
  readonly database: 'connected' | 'unreachable' | 'unconfigured';
}

export function createHealthRoutes(dbInstance?: DatabaseInstance): FastifyPluginAsync {
  return async (fastify) => {
    fastify.get('/health', async (): Promise<HealthCheckResponse> => {
      let databaseStatus: HealthCheckResponse['database'] = 'unconfigured';

      if (dbInstance) {
        try {
          await dbInstance.db.execute(sql`SELECT 1`);
          databaseStatus = 'connected';
        } catch {
          databaseStatus = 'unreachable';
        }
      }

      return {
        status: databaseStatus === 'unreachable' ? 'degraded' : 'ok',
        version: '0.1.0',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: databaseStatus,
      };
    });
  };
}
