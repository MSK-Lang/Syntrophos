import type { FastifyRequest } from 'fastify';

export const SENSITIVE_REDACTION_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.headers["idempotency-key"]',
  'headers.authorization',
  'headers.cookie',
  'password',
  'passwordHash',
  'token',
  'tokenHash',
  'apiKey',
  'encryptedApiKey',
  'ciphertext',
  'authTag',
  'iv',
  'encryptionMasterKey',
  '*.password',
  '*.passwordHash',
  '*.token',
  '*.tokenHash',
  '*.apiKey',
  '*.encryptedApiKey',
  '*.ciphertext',
  '*.authTag',
  '*.iv',
];

export function createLoggerConfig(logLevel: string) {
  return {
    level: logLevel,
    redact: {
      paths: SENSITIVE_REDACTION_PATHS,
      censor: '[REDACTED]',
    },
    serializers: {
      req(req: FastifyRequest) {
        return {
          method: req.method,
          url: req.url,
          path: req.routeOptions?.url || req.url,
          parameters: req.params,
          headers: req.headers,
          remoteAddress: req.ip,
          requestId: req.id,
        };
      },
      res(res: { statusCode: number }) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  };
}
