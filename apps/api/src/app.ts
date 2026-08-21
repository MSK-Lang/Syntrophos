import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import type { AppConfig } from './config/env.js';
import type { DatabaseInstance } from './db/index.js';
import { globalErrorHandler, notFoundHandler } from './lib/error-handler.js';
import { createLoggerConfig } from './lib/logger.js';
import { authPlugin } from './plugins/auth.js';
import { csrfPlugin } from './plugins/csrf.js';
import { workspacePlugin } from './plugins/workspace.js';
import { createHealthRoutes } from './routes/health.js';
import { createV1Routes } from './routes/v1/index.js';

export function createApp(config: AppConfig, dbInstance?: DatabaseInstance): FastifyInstance {
  const isProduction = config.nodeEnv === 'production';

  const app = Fastify({
    logger: createLoggerConfig(config.logLevel),
    requestIdHeader: 'x-request-id',
  });

  // 1. CORS Configuration (Explicit origins, credentials enabled, zero wildcard)
  void app.register(cors, {
    origin: (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        cb(null, true);
        return;
      }
      if (config.corsAllowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Workspace-ID', 'X-Requested-With'],
    exposedHeaders: ['X-Cache-Lookup', 'Idempotency-Key'],
  });

  // 2. Cookie Support
  void app.register(cookie);

  // 3. CSRF Protection for state-changing requests
  void app.register(csrfPlugin, {
    allowedOrigins: config.corsAllowedOrigins,
  });

  // 4. Authentication and Workspace Context Plugins
  void app.register(authPlugin, { dbInstance });
  void app.register(workspacePlugin, { dbInstance });

  // 5. Global Error Handling
  app.setErrorHandler(globalErrorHandler);
  app.setNotFoundHandler(notFoundHandler);

  // 6. Health Routes
  void app.register(createHealthRoutes(dbInstance));

  // 7. API v1 Namespace
  void app.register(createV1Routes({ dbInstance, isProduction }), { prefix: '/api/v1' });

  return app;
}
