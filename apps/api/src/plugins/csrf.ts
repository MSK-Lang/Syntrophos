import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

export interface CsrfPluginOptions {
  allowedOrigins: readonly string[];
}

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const csrfPluginCallback: FastifyPluginAsync<CsrfPluginOptions> = async (fastify, options) => {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply) => {
    // Only protect state-changing requests
    if (!STATE_CHANGING_METHODS.has(request.method.toUpperCase())) {
      return;
    }

    const origin = request.headers.origin;
    const referer = request.headers.referer;

    // If Origin is present, it MUST match the allowed origins list
    if (origin) {
      if (!options.allowedOrigins.includes(origin)) {
        request.log.warn({ origin, path: request.url }, 'CSRF: Blocked state-changing request from disallowed origin');
        return reply.status(403).send({
          error: {
            code: 'CSRF_ORIGIN_INVALID',
            message: 'State-changing request origin is not permitted',
          },
        });
      }
      return;
    }

    // If Origin is missing, check Referer as fallback (for older browsers / same-origin fetch)
    if (referer) {
      try {
        const parsedReferer = new URL(referer);
        const refererOrigin = parsedReferer.origin;
        if (!options.allowedOrigins.includes(refererOrigin)) {
          request.log.warn({ referer, path: request.url }, 'CSRF: Blocked state-changing request from disallowed referer');
          return reply.status(403).send({
            error: {
              code: 'CSRF_ORIGIN_INVALID',
              message: 'State-changing request referer is not permitted',
            },
          });
        }
      } catch {
        return reply.status(403).send({
          error: {
            code: 'CSRF_ORIGIN_INVALID',
            message: 'Invalid referer header provided',
          },
        });
      }
    }
  });
};

export const csrfPlugin = fp(csrfPluginCallback, {
  name: 'csrfPlugin',
});
