import type { FastifyPluginAsync } from 'fastify';
import { and, eq, isNull } from 'drizzle-orm';
import type { DatabaseInstance } from '../../db/index.js';
import { workspaceInvitations, workspaceMembers, workspaces } from '../../db/schema/index.js';
import { recordAuditEvent } from '../../lib/audit.js';
import { rateLimiter } from '../../lib/rate-limiter.js';
import { hashToken } from '../../lib/session.js';

export function createInvitationAcceptanceRoutes(dbInstance?: DatabaseInstance): FastifyPluginAsync {
  return async (fastify) => {
    fastify.post(
      '/invitations/:token/accept',
      { preHandler: [fastify.authenticate] },
      async (request, reply) => {
        if (!dbInstance || !request.user) {
          return reply.status(503).send({
            error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
          });
        }

        const clientIp = request.ip || '127.0.0.1';
        const rateCheck = rateLimiter.check(`${clientIp}:invitations:accept`, 10, 60 * 1000);
        if (!rateCheck.allowed) {
          return reply.status(429).send({
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: `Too many invitation attempts. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
            },
          });
        }

        const params = request.params as { token: string };
        const rawToken = params.token;

        if (!rawToken || rawToken.trim().length === 0) {
          return reply.status(400).send({
            error: {
              code: 'INVITATION_INVALID',
              message: 'Invitation token is missing or invalid.',
            },
          });
        }

        const tokenHash = hashToken(rawToken);

        // Lookup invitation by token hash
        const invitation = await dbInstance.db.query.workspaceInvitations.findFirst({
          where: eq(workspaceInvitations.tokenHash, tokenHash),
        });

        if (!invitation) {
          return reply.status(404).send({
            error: {
              code: 'INVITATION_INVALID',
              message: 'Invitation token not found.',
            },
          });
        }

        if (invitation.acceptedAt) {
          return reply.status(400).send({
            error: {
              code: 'INVITATION_ALREADY_ACCEPTED',
              message: 'This invitation has already been accepted.',
            },
          });
        }

        if (invitation.revokedAt) {
          return reply.status(400).send({
            error: {
              code: 'INVITATION_REVOKED',
              message: 'This invitation has been revoked by an administrator.',
            },
          });
        }

        if (invitation.expiresAt < new Date()) {
          return reply.status(400).send({
            error: {
              code: 'INVITATION_EXPIRED',
              message: 'This invitation has expired.',
            },
          });
        }

        // Verify that the accepting user's email matches the invited email
        if (request.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
          return reply.status(403).send({
            error: {
              code: 'INVITATION_EMAIL_MISMATCH',
              message: `This invitation was issued for ${invitation.email}. You are signed in as ${request.user.email}.`,
            },
          });
        }

        // Check if user is already a member
        const existingMember = await dbInstance.db.query.workspaceMembers.findFirst({
          where: and(
            eq(workspaceMembers.workspaceId, invitation.workspaceId),
            eq(workspaceMembers.userId, request.user.id),
          ),
        });

        if (existingMember) {
          return reply.status(409).send({
            error: {
              code: 'USER_ALREADY_MEMBER',
              message: 'You are already a member of this workspace.',
            },
          });
        }

        // Perform acceptance inside database transaction
        await dbInstance.db.transaction(async (tx) => {
          // 1. Insert Member
          await tx.insert(workspaceMembers).values({
            workspaceId: invitation.workspaceId,
            userId: request.user!.id,
            role: invitation.role,
          });

          // 2. Mark Invitation Accepted
          await tx
            .update(workspaceInvitations)
            .set({ acceptedAt: new Date() })
            .where(eq(workspaceInvitations.id, invitation.id));
        });

        // Audit logs
        await recordAuditEvent(dbInstance, {
          workspaceId: invitation.workspaceId,
          actorType: 'user',
          actorId: request.user.id,
          eventCategory: 'invitation',
          action: 'INVITATION_ACCEPTED',
          resourceType: 'workspace_invitation',
          resourceId: invitation.id,
        });

        await recordAuditEvent(dbInstance, {
          workspaceId: invitation.workspaceId,
          actorType: 'user',
          actorId: request.user.id,
          eventCategory: 'membership',
          action: 'MEMBER_ADDED',
          resourceType: 'user',
          resourceId: request.user.id,
          metadata: { role: invitation.role },
        });

        // Retrieve workspace summary
        const targetWorkspace = await dbInstance.db.query.workspaces.findFirst({
          where: and(
            eq(workspaces.id, invitation.workspaceId),
            isNull(workspaces.deletedAt),
          ),
        });

        return reply.status(200).send({
          success: true,
          workspace: {
            ...targetWorkspace,
            role: invitation.role,
          },
        });
      },
    );
  };
}
