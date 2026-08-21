import type { FastifyPluginAsync } from 'fastify';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { DatabaseInstance } from '../../db/index.js';
import { sessions, users, workspaceMembers, workspaces } from '../../db/schema/index.js';
import { recordAuditEvent } from '../../lib/audit.js';
import { hashPassword, normalizeEmail, validatePassword, verifyPassword } from '../../lib/password.js';
import { rateLimiter } from '../../lib/rate-limiter.js';
import { generateSecureToken, getSessionCookieOptions, hashToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '../../lib/session.js';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export function createAuthRoutes(dbInstance?: DatabaseInstance, isProduction = false): FastifyPluginAsync {
  return async (fastify) => {
    // 1. SIGNUP
    fastify.post('/auth/signup', async (request, reply) => {
      if (!dbInstance) {
        return reply.status(503).send({
          error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
        });
      }

      // Rate limit signup attempts (5 per minute per IP)
      const clientIp = request.ip || '127.0.0.1';
      const rateCheck = rateLimiter.check(`${clientIp}:auth:signup`, 5, 60 * 1000);
      if (!rateCheck.allowed) {
        return reply.status(429).send({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many signup attempts. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
          },
        });
      }

      const parseResult = signupSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email or password format',
            details: parseResult.error.issues,
          },
        });
      }

      const { email, password, name } = parseResult.data;
      const normalizedEmail = normalizeEmail(email);

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return reply.status(400).send({
          error: {
            code: 'WEAK_PASSWORD',
            message: passwordValidation.reason || 'Password does not meet security requirements',
          },
        });
      }

      // Check if user already exists (case-insensitive)
      const existingUser = await dbInstance.db.query.users.findFirst({
        where: and(
          sql`lower(${users.email}) = ${normalizedEmail}`,
          isNull(users.deletedAt),
        ),
      });

      if (existingUser) {
        // Return a generic error to prevent account enumeration
        return reply.status(409).send({
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email already exists',
          },
        });
      }

      const passwordHash = await hashPassword(password);
      const rawSessionToken = generateSecureToken();
      const tokenHash = hashToken(rawSessionToken);
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      const userName = name || normalizedEmail.split('@')[0] || 'User';

      // Atomic multi-step transaction for signup
      const result = await dbInstance.db.transaction(async (tx) => {
        // 1. Insert User
        const [newUser] = await tx
          .insert(users)
          .values({
            email: normalizedEmail,
            passwordHash,
            name: userName,
            displayName: userName,
            emailVerified: false,
          })
          .returning();

        if (!newUser) {
          throw new Error('Failed to create user record');
        }

        // 2. Insert Personal Workspace
        const [personalWorkspace] = await tx
          .insert(workspaces)
          .values({
            name: `${userName}'s Workspace`,
            workspaceType: 'personal',
            subscriptionPlan: 'free',
          })
          .returning();

        if (!personalWorkspace) {
          throw new Error('Failed to create personal workspace record');
        }

        // 3. Insert Workspace Membership (Owner)
        await tx.insert(workspaceMembers).values({
          workspaceId: personalWorkspace.id,
          userId: newUser.id,
          role: 'owner',
        });

        // 4. Insert Session
        await tx.insert(sessions).values({
          userId: newUser.id,
          tokenHash,
          expiresAt,
          ipAddress: clientIp,
          userAgent: request.headers['user-agent'] || null,
        });

        return { user: newUser, workspace: personalWorkspace };
      });

      // Issue HTTP-only secure cookie
      void reply.setCookie(
        SESSION_COOKIE_NAME,
        rawSessionToken,
        getSessionCookieOptions(isProduction),
      );

      // Audit log
      await recordAuditEvent(dbInstance, {
        workspaceId: result.workspace.id,
        actorType: 'user',
        actorId: result.user.id,
        eventCategory: 'auth',
        action: 'USER_SIGNED_UP',
        resourceType: 'user',
        resourceId: result.user.id,
        ipAddress: clientIp,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...safeUser } = result.user;

      return reply.status(201).send({
        user: safeUser,
        workspace: result.workspace,
      });
    });

    // 2. LOGIN
    fastify.post('/auth/login', async (request, reply) => {
      if (!dbInstance) {
        return reply.status(503).send({
          error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
        });
      }

      const clientIp = request.ip || '127.0.0.1';
      const rateCheck = rateLimiter.check(`${clientIp}:auth:login`, 10, 60 * 1000);
      if (!rateCheck.allowed) {
        return reply.status(429).send({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many login attempts. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
          },
        });
      }

      const parseResult = loginSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid credentials format',
          },
        });
      }

      const { email, password } = parseResult.data;
      const normalizedEmail = normalizeEmail(email);

      const targetUser = await dbInstance.db.query.users.findFirst({
        where: and(
          sql`lower(${users.email}) = ${normalizedEmail}`,
          isNull(users.deletedAt),
        ),
      });

      if (!targetUser) {
        return reply.status(401).send({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email address or password',
          },
        });
      }

      if (!targetUser.passwordHash || !(await verifyPassword(password, targetUser.passwordHash))) {
        return reply.status(401).send({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email address or password',
          },
        });
      }

      // Create new session
      const rawSessionToken = generateSecureToken();
      const tokenHash = hashToken(rawSessionToken);
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

      await dbInstance.db.insert(sessions).values({
        userId: targetUser.id,
        tokenHash,
        expiresAt,
        ipAddress: clientIp,
        userAgent: request.headers['user-agent'] || null,
      });

      // Update user last active timestamp
      await dbInstance.db
        .update(users)
        .set({ lastActiveAt: new Date() })
        .where(eq(users.id, targetUser.id));

      // Issue HTTP-only secure cookie
      void reply.setCookie(
        SESSION_COOKIE_NAME,
        rawSessionToken,
        getSessionCookieOptions(isProduction),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...safeUser } = targetUser;

      return reply.status(200).send({
        user: safeUser,
      });
    });

    // 3. LOGOUT
    fastify.post('/auth/logout', { preHandler: [fastify.authenticate] }, async (request, reply) => {
      if (!dbInstance) {
        return reply.status(503).send({
          error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
        });
      }

      if (request.session) {
        await dbInstance.db
          .update(sessions)
          .set({ revokedAt: new Date() })
          .where(eq(sessions.id, request.session.id));
      }

      void reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });

      return reply.status(200).send({
        success: true,
        message: 'Logged out successfully',
      });
    });

    // 4. ME (Current User Profile & Authorized Workspaces)
    fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
      if (!dbInstance || !request.user) {
        return reply.status(503).send({
          error: { code: 'DATABASE_UNAVAILABLE', message: 'Database service is unavailable' },
        });
      }

      // Load all workspaces where user is an active member
      const memberWorkspaces = await dbInstance.db
        .select({
          workspace: workspaces,
          membership: workspaceMembers,
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
        user: request.user,
        workspaces: memberWorkspaces.map((mw) => ({
          ...mw.workspace,
          role: mw.membership.role,
          joinedAt: mw.membership.joinedAt,
        })),
      });
    });
  };
}
