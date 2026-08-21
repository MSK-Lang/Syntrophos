import type { FastifyPluginAsync } from 'fastify';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import type { DatabaseInstance } from '../../db/index.js';
import { users, workspaceInvitations, workspaceMembers, workspaces } from '../../db/schema/index.js';
import { recordAuditEvent } from '../../lib/audit.js';
import { normalizeEmail } from '../../lib/password.js';
import { generateSecureToken, hashToken, INVITATION_DURATION_MS } from '../../lib/session.js';

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  workspaceType: z.enum(['personal', 'business']).default('personal'),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

export function createWorkspaceRoutes(dbInstance?: DatabaseInstance, isProduction = false): FastifyPluginAsync {
  return async (fastify) => {
    // 1. LIST WORKSPACES
    fastify.get('/workspaces', { preHandler: [fastify.authenticate] }, async (request, reply) => {
      if (!dbInstance || !request.user) {
        return reply.status(503).send({
          error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
        });
      }

      const rows = await dbInstance.db
        .select({
          workspace: workspaces,
          role: workspaceMembers.role,
          joinedAt: workspaceMembers.joinedAt,
        })
        .from(workspaceMembers)
        .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
        .where(
          and(
            eq(workspaceMembers.userId, request.user.id),
            isNull(workspaces.deletedAt),
          ),
        );

      return reply.status(200).send({
        workspaces: rows.map((r) => ({
          ...r.workspace,
          role: r.role,
          joinedAt: r.joinedAt,
        })),
      });
    });

    // 2. CREATE WORKSPACE
    fastify.post('/workspaces', { preHandler: [fastify.authenticate] }, async (request, reply) => {
      if (!dbInstance || !request.user) {
        return reply.status(503).send({
          error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
        });
      }

      const parseResult = createWorkspaceSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid workspace parameters',
            details: parseResult.error.issues,
          },
        });
      }

      const { name, description, workspaceType } = parseResult.data;

      const created = await dbInstance.db.transaction(async (tx) => {
        const [ws] = await tx
          .insert(workspaces)
          .values({
            name,
            description,
            workspaceType,
            subscriptionPlan: 'free',
          })
          .returning();

        if (!ws) {
          throw new Error('Failed to create workspace record');
        }

        await tx.insert(workspaceMembers).values({
          workspaceId: ws.id,
          userId: request.user!.id,
          role: 'owner',
        });

        return ws;
      });

      await recordAuditEvent(dbInstance, {
        workspaceId: created.id,
        actorType: 'user',
        actorId: request.user.id,
        eventCategory: 'workspace',
        action: 'WORKSPACE_CREATED',
        resourceType: 'workspace',
        resourceId: created.id,
        ipAddress: request.ip,
      });

      return reply.status(201).send({
        workspace: {
          ...created,
          role: 'owner',
        },
      });
    });

    // 3. GET WORKSPACE BY ID
    fastify.get(
      '/workspaces/:workspaceId',
      { preHandler: [fastify.authenticate, fastify.requireWorkspaceMembership] },
      async (request, reply) => {
        return reply.status(200).send({
          workspace: {
            ...request.workspace,
            role: request.workspaceMember?.role,
            joinedAt: request.workspaceMember?.joinedAt,
          },
        });
      },
    );

    // 4. LIST WORKSPACE MEMBERS
    fastify.get(
      '/workspaces/:workspaceId/members',
      { preHandler: [fastify.authenticate, fastify.requireWorkspaceMembership] },
      async (request, reply) => {
        if (!dbInstance || !request.workspace) {
          return reply.status(503).send({
            error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
          });
        }

        const members = await dbInstance.db
          .select({
            id: workspaceMembers.id,
            role: workspaceMembers.role,
            joinedAt: workspaceMembers.joinedAt,
            lastActiveAt: workspaceMembers.lastActiveAt,
            user: {
              id: users.id,
              email: users.email,
              name: users.name,
              displayName: users.displayName,
              avatarUrl: users.avatarUrl,
            },
          })
          .from(workspaceMembers)
          .innerJoin(users, eq(workspaceMembers.userId, users.id))
          .where(
            and(
              eq(workspaceMembers.workspaceId, request.workspace.id),
              isNull(users.deletedAt),
            ),
          );

        return reply.status(200).send({ members });
      },
    );

    // 5. CREATE WORKSPACE INVITATION (Requires owner or admin)
    fastify.post(
      '/workspaces/:workspaceId/invitations',
      {
        preHandler: [
          fastify.authenticate,
          fastify.requireWorkspaceMembership,
          fastify.requireRole(['owner', 'admin']),
        ],
      },
      async (request, reply) => {
        if (!dbInstance || !request.workspace || !request.user) {
          return reply.status(503).send({
            error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
          });
        }

        const parseResult = inviteMemberSchema.safeParse(request.body);
        if (!parseResult.success) {
          return reply.status(400).send({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid invitation payload',
              details: parseResult.error.issues,
            },
          });
        }

        const { email, role } = parseResult.data;
        const normalizedEmail = normalizeEmail(email);

        // Check if user is already a member
        const existingMember = await dbInstance.db
          .select({ id: workspaceMembers.id })
          .from(workspaceMembers)
          .innerJoin(users, eq(workspaceMembers.userId, users.id))
          .where(
            and(
              eq(workspaceMembers.workspaceId, request.workspace.id),
              eq(users.email, normalizedEmail),
            ),
          );

        if (existingMember.length > 0) {
          return reply.status(409).send({
            error: {
              code: 'USER_ALREADY_MEMBER',
              message: 'This user is already a member of the workspace.',
            },
          });
        }

        const rawInviteToken = generateSecureToken();
        const tokenHash = hashToken(rawInviteToken);
        const expiresAt = new Date(Date.now() + INVITATION_DURATION_MS);

        const [invite] = await dbInstance.db
          .insert(workspaceInvitations)
          .values({
            workspaceId: request.workspace.id,
            email: normalizedEmail,
            role,
            tokenHash,
            invitedById: request.user.id,
            expiresAt,
          })
          .returning();

        if (!invite) {
          throw new Error('Failed to create workspace invitation');
        }

        await recordAuditEvent(dbInstance, {
          workspaceId: request.workspace.id,
          actorType: 'user',
          actorId: request.user.id,
          eventCategory: 'invitation',
          action: 'INVITATION_CREATED',
          resourceType: 'workspace_invitation',
          resourceId: invite.id,
          metadata: { email: normalizedEmail, role },
        });

        return reply.status(201).send({
          invitation: {
            id: invite.id,
            workspaceId: invite.workspaceId,
            email: invite.email,
            role: invite.role,
            expiresAt: invite.expiresAt,
            createdAt: invite.createdAt,
            // Include raw invitation token in response for development / delivery trigger
            ...(isProduction ? {} : { rawToken: rawInviteToken }),
          },
        });
      },
    );

    // 6. LIST WORKSPACE INVITATIONS (Requires owner or admin)
    fastify.get(
      '/workspaces/:workspaceId/invitations',
      {
        preHandler: [
          fastify.authenticate,
          fastify.requireWorkspaceMembership,
          fastify.requireRole(['owner', 'admin']),
        ],
      },
      async (request, reply) => {
        if (!dbInstance || !request.workspace) {
          return reply.status(503).send({
            error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
          });
        }

        const invites = await dbInstance.db.query.workspaceInvitations.findMany({
          where: and(
            eq(workspaceInvitations.workspaceId, request.workspace.id),
            isNull(workspaceInvitations.acceptedAt),
            isNull(workspaceInvitations.revokedAt),
          ),
        });

        return reply.status(200).send({
          invitations: invites.map((inv) => ({
            id: inv.id,
            workspaceId: inv.workspaceId,
            email: inv.email,
            role: inv.role,
            expiresAt: inv.expiresAt,
            createdAt: inv.createdAt,
          })),
        });
      },
    );

    // 7. REVOKE WORKSPACE INVITATION (Requires owner or admin)
    fastify.delete(
      '/workspaces/:workspaceId/invitations/:invitationId',
      {
        preHandler: [
          fastify.authenticate,
          fastify.requireWorkspaceMembership,
          fastify.requireRole(['owner', 'admin']),
        ],
      },
      async (request, reply) => {
        if (!dbInstance || !request.workspace || !request.user) {
          return reply.status(503).send({
            error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
          });
        }

        const params = request.params as { workspaceId: string; invitationId: string };

        const targetInvite = await dbInstance.db.query.workspaceInvitations.findFirst({
          where: and(
            eq(workspaceInvitations.id, params.invitationId),
            eq(workspaceInvitations.workspaceId, request.workspace.id),
          ),
        });

        if (!targetInvite) {
          return reply.status(404).send({
            error: {
              code: 'INVITATION_NOT_FOUND',
              message: 'Invitation not found in this workspace.',
            },
          });
        }

        await dbInstance.db
          .update(workspaceInvitations)
          .set({ revokedAt: new Date() })
          .where(eq(workspaceInvitations.id, targetInvite.id));

        await recordAuditEvent(dbInstance, {
          workspaceId: request.workspace.id,
          actorType: 'user',
          actorId: request.user.id,
          eventCategory: 'invitation',
          action: 'INVITATION_REVOKED',
          resourceType: 'workspace_invitation',
          resourceId: targetInvite.id,
        });

        return reply.status(200).send({
          success: true,
          message: 'Invitation revoked successfully',
        });
      },
    );
  };
}
