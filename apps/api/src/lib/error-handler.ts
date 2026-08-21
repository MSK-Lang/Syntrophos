import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export interface StructuredErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

export function globalErrorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  // 1. Zod / Request Validation Errors
  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    const response: StructuredErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or query parameters',
        details: issues,
      },
    };

    void reply.status(400).send(response);
    return;
  }

  // Fastify Schema Validation Error
  if ('validation' in error && error.validation) {
    const response: StructuredErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Request validation failed',
        details: error.validation,
      },
    };

    void reply.status(400).send(response);
    return;
  }

  // 2. PostgreSQL Constraint Violations (Postgres-JS error format)
  const pgError = error as { code?: string; constraint_name?: string; message?: string };

  if (pgError.code === '23505') {
    // Unique violation
    const response: StructuredErrorResponse = {
      error: {
        code: 'CONFLICT_ERROR',
        message: 'A resource with conflicting unique fields already exists',
      },
    };

    void reply.status(409).send(response);
    return;
  }

  if (pgError.code === '23503') {
    // Foreign key violation
    const response: StructuredErrorResponse = {
      error: {
        code: 'RELATIONAL_INTEGRITY_ERROR',
        message: 'Referenced entity not found or invalid workspace relationship',
      },
    };

    void reply.status(400).send(response);
    return;
  }

  // 3. Database Connection Failures
  const isConnRefused =
    pgError.code === 'ECONNREFUSED' ||
    (error as { cause?: { code?: string } }).cause?.code === 'ECONNREFUSED' ||
    error.message?.includes('ECONNREFUSED');

  if (isConnRefused) {
    request.log.error(
      {
        dbError: 'DB_CONNECTION_FAILED',
        code: pgError.code || 'ECONNREFUSED',
        requestId: request.id,
      },
      'Database connection failure: service is unreachable',
    );

    const response: StructuredErrorResponse = {
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database service is currently unreachable. Please verify database connection.',
      },
    };

    void reply.status(503).send(response);
    return;
  }


  // 4. Fastify Standard HTTP Status Codes
  const statusCode = (error as FastifyError).statusCode || 500;


  if (statusCode === 404) {
    const response: StructuredErrorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: error.message || 'The requested resource was not found',
      },
    };
    void reply.status(404).send(response);
    return;
  }

  if (statusCode === 401) {
    const response: StructuredErrorResponse = {
      error: {
        code: 'UNAUTHORIZED',
        message: error.message || 'Authentication required',
      },
    };
    void reply.status(401).send(response);
    return;
  }

  if (statusCode === 403) {
    const response: StructuredErrorResponse = {
      error: {
        code: 'FORBIDDEN',
        message: error.message || 'Access denied for the target workspace',
      },
    };
    void reply.status(403).send(response);
    return;
  }

  // 4. Fallback Internal Server Error (Zero Stacktrace/Internal Info Leakage)
  request.log.error({ err: error, requestId: request.id }, 'Unhandled server error');

  const response: StructuredErrorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred',
    },
  };

  void reply.status(500).send(response);
}

export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  const response: StructuredErrorResponse = {
    error: {
      code: 'NOT_FOUND',
      message: `Route ${request.method} ${request.url} not found`,
    },
  };
  void reply.status(404).send(response);
}
