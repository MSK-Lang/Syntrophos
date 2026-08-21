import type { FastifyPluginAsync } from 'fastify';
import type { DatabaseInstance } from '../../db/index.js';
import { createAuthRoutes } from './auth.js';
import { createInvitationAcceptanceRoutes } from './invitations.js';
import { createWorkspaceRoutes } from './workspaces.js';

export interface V1RoutesOptions {
  dbInstance?: DatabaseInstance | undefined;
  isProduction?: boolean | undefined;
}

export const createV1Routes = (options: V1RoutesOptions): FastifyPluginAsync => {
  return async (fastify) => {
    fastify.get('/', async () => ({
      api: 'Syntrophos API',
      version: 'v1',
      status: 'active',
    }));

    // Register Auth Routes
    void fastify.register(createAuthRoutes(options.dbInstance, options.isProduction));

    // Register Workspace Routes
    void fastify.register(createWorkspaceRoutes(options.dbInstance, options.isProduction));

    // Register Public Invitation Acceptance Routes
    void fastify.register(createInvitationAcceptanceRoutes(options.dbInstance));
  };
};
