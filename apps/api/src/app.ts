import Fastify, { type FastifyInstance } from 'fastify';

import type { AppConfig } from './config/env.js';

export interface HealthResponse {
  readonly status: 'ok';
}

export function createApp(config: AppConfig): FastifyInstance {
  const app = Fastify({
    logger: {
      level: config.logLevel,
    },
  });

  app.get('/health', async (): Promise<HealthResponse> => ({ status: 'ok' }));

  return app;
}
