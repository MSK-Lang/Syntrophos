import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { and, eq, isNull } from 'drizzle-orm';
import type { DatabaseInstance } from '../db/index.js';
import { workspaceMembers, workspaces, type Workspace, type WorkspaceMember } from '../db/schema/index.js';

declare module 'fastify' {
  interface FastifyRequest {
    workspace?: Workspace;
    workspaceMember?: WorkspaceMember;
  }
  interface FastifyInstance {
    requireWorkspaceMembership: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (allowedRoles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface WorkspacePluginOptions {
  dbInstance?: DatabaseInstance | undefined;
}

const workspacePluginCallback: FastifyPluginAsync<WorkspacePluginOptions> = async (fastify, options) => {
  fastify.decorateRequest('workspace', undefined);
  fastify.decorateRequest('workspaceMember', undefined);

  const requireWorkspaceMembership = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!options.dbInstance) {
      return reply.status(503).send({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Workspace service is unavailable',
        },
      });
    }

    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required before establishing workspace context.',
        },
      });
    }

    // Extract workspaceId from URL params or Header
    const params = request.params as Record<string, string | undefined>;
    const workspaceId = params.workspaceId || (request.headers['x-workspace-id'] as string | undefined);

    if (!workspaceId) {
      return reply.status(400).send({
        error: {
          code: 'WORKSPACE_ID_REQUIRED',
          message: 'Workspace ID must be provided in the request path.',
        },
      });
    }

    // Load active workspace
    const targetWorkspace = await options.dbInstance.db.query.workspaces.findFirst({
      where: and(
        eq(workspaces.id, workspaceId),
        isNull(workspaces.deletedAt),
      ),
    });

    if (!targetWorkspace) {
      return reply.status(404).send({
        error: {
          code: 'WORKSPACE_NOT_FOUND',
          message: 'The specified workspace does not exist.',
        },
      });
    }

    // Authorize caller's membership in the target workspace
    const member = await options.dbInstance.db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, request.user.id),
      ),
    });

    if (!member) {
      return reply.status(403).send({
        error: {
          code: 'WORKSPACE_ACCESS_DENIED',
          message: 'You do not have permission to access this workspace.',
        },
      });
    }

    request.workspace = targetWorkspace;
    request.workspaceMember = member;
  };

  const requireRole = (allowedRoles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.workspaceMember) {
        return reply.status(403).send({
          error: {
            code: 'WORKSPACE_CONTEXT_REQUIRED',
            message: 'Workspace context must be established before checking permissions.',
          },
        });
      }

      if (!allowedRoles.includes(request.workspaceMember.role)) {
        return reply.status(403).send({
          error: {
            code: 'FORBIDDEN_ROLE',
            message: `Action requires one of the following roles: ${allowedRoles.join(', ')}. Current role: ${request.workspaceMember.role}`,
          },
        });
      }
    };
  };

  fastify.decorate('requireWorkspaceMembership', requireWorkspaceMembership);
  fastify.decorate('requireRole', requireRole);
};

export const workspacePlugin = fp(workspacePluginCallback, {
  name: 'workspacePlugin',
  dependencies: ['authPlugin'],
});
