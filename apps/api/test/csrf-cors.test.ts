/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';

describe('CSRF & CORS Security Verification', () => {
  const config = loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'fatal',
    CORS_ALLOWED_ORIGINS: 'http://localhost:3000,http://app.syntrophos.local',
  });

  const mockDbInstance: any = {
    db: {
      execute: async () => {},
      query: {
        users: { findFirst: async () => undefined },
        sessions: { findFirst: async () => undefined },
      },
    },
    close: async () => {},
  };

  it('allows state-changing POST from authorized origin', async () => {
    const app = createApp(config, mockDbInstance);
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/signup',
      headers: {
        origin: 'http://localhost:3000',
      },
      payload: {
        email: 'invalid-payload-just-testing-csrf',
      },
    });

    // Passes CSRF origin check and proceeds to schema validation
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    await app.close();
  });

  it('blocks state-changing POST from disallowed origin with 403 CSRF_ORIGIN_INVALID', async () => {
    const app = createApp(config, mockDbInstance);
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/signup',
      headers: {
        origin: 'http://evil-attacker.com',
      },
      payload: {
        email: 'attacker@evil.com',
        password: 'password123',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = res.json();
    expect(body.error.code).toBe('CSRF_ORIGIN_INVALID');
    expect(body.error.message).toBe('State-changing request origin is not permitted');
    await app.close();
  });

  it('allows safe GET requests from any origin without blocking', async () => {
    const app = createApp(config, mockDbInstance);
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: 'http://third-party-monitor.com',
      },
    });

    expect(res.statusCode).toBe(200);
    await app.close();
  });

  it('handles CORS preflight OPTIONS requests for allowed origin', async () => {
    const app = createApp(config, mockDbInstance);
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/api/v1/auth/login',
      headers: {
        origin: 'http://localhost:3000',
        'access-control-request-method': 'POST',
      },
    });

    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    await app.close();
  });
});
