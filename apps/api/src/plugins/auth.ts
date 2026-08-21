import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { and, eq, gt, isNull } from 'drizzle-orm';
import type { DatabaseInstance } from '../db/index.js';
import { sessions, users, type Session, type User } from '../db/schema/index.js';
import { hashToken, SESSION_COOKIE_NAME } from '../lib/session.js';

export type AuthenticatedUser = Omit<User, 'passwordHash'>;

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
    session?: Session;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AuthPluginOptions {
  dbInstance?: DatabaseInstance | undefined;
}

const authPluginCallback: FastifyPluginAsync<AuthPluginOptions> = async (fastify, options) => {
  fastify.decorateRequest('user', undefined);
  fastify.decorateRequest('session', undefined);

  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!options.dbInstance) {
      return reply.status(503).send({
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Authentication service is unavailable',
        },
      });
    }

    // 1. Extract Token from Cookie (canonical) or Authorization Bearer header
    let rawToken: string | undefined = request.cookies?.[SESSION_COOKIE_NAME];

    if (!rawToken && request.headers.authorization) {
      const parts = request.headers.authorization.split(' ');
      if (parts[0] === 'Bearer' && parts[1]) {
        rawToken = parts[1];
      }
    }

    if (!rawToken) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in.',
        },
      });
    }

    // 2. Look up active session in Database
    const tokenHash = hashToken(rawToken);

    const activeSession = await options.dbInstance.db.query.sessions.findFirst({
      where: and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
        isNull(sessions.revokedAt),
      ),
    });

    if (!activeSession) {
      return reply.status(401).send({
        error: {
          code: 'SESSION_INVALID',
          message: 'Session is invalid or has expired. Please sign in again.',
        },
      });
    }

    // 3. Load active user
    const activeUser = await options.dbInstance.db.query.users.findFirst({
      where: and(
        eq(users.id, activeSession.userId),
        isNull(users.deletedAt),
      ),
    });

    if (!activeUser) {
      return reply.status(401).send({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account no longer exists or is disabled.',
        },
      });
    }

    // 4. Update lastUsedAt asynchronously
    void options.dbInstance.db
      .update(sessions)
      .set({ lastUsedAt: new Date() })
      .where(eq(sessions.id, activeSession.id))
      .catch(() => {});

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = activeUser;
    request.user = safeUser;
    request.session = activeSession;
  };

  fastify.decorate('authenticate', authenticate);
};

export const authPlugin = fp(authPluginCallback, {
  name: 'authPlugin',
  dependencies: ['@fastify/cookie'],
});

