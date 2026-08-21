import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';

describe('Global Error Handler & Information Protection', () => {
  const config = loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'fatal', // Quiet logs during error tests
  });

  it('formats 404 routes into standard structured error without stack traces', async () => {
    const app = createApp(config);
    const res = await app.inject({
      method: 'GET',
      url: '/non-existent-route',
    });

    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Route GET /non-existent-route not found',
      },
    });
    expect(body.stack).toBeUndefined();
    await app.close();
  });

  it('formats Zod validation errors into structured VALIDATION_ERROR responses', async () => {
    const app = createApp(config);

    // Register a test route with Zod validation
    const testSchema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
    });

    app.post('/test/validate', async (req) => {
      const parsed = testSchema.parse(req.body);
      return { success: true, data: parsed };
    });

    const res = await app.inject({
      method: 'POST',
      url: '/test/validate',
      payload: {
        name: 'a', // Too short
        email: 'invalid-email',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Invalid request payload or query parameters');
    expect(Array.isArray(body.error.details)).toBe(true);
    expect(body.error.details.length).toBe(2);
    await app.close();
  });

  it('catches unexpected internal errors and returns safe 500 without leaking internals', async () => {
    const app = createApp(config);

    app.get('/test/crash', async () => {
      throw new Error('Database password was supersecret123 at /var/secret.key');
    });

    const res = await app.inject({
      method: 'GET',
      url: '/test/crash',
    });

    expect(res.statusCode).toBe(500);
    const body = res.json();
    expect(body).toEqual({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred',
      },
    });
    expect(JSON.stringify(body)).not.toContain('supersecret123');
    expect(JSON.stringify(body)).not.toContain('/var/secret.key');
    await app.close();
  });
});
