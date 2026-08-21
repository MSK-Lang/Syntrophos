import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';

describe('Health & API v1 Namespace Routes', () => {
  const config = loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'fatal',
  });

  it('GET /health returns healthy status, uptime, and database status', async () => {
    const app = createApp(config);
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBe('0.1.0');
    expect(typeof body.uptimeSeconds).toBe('number');
    expect(typeof body.timestamp).toBe('string');
    expect(body.database).toBe('unconfigured');
    await app.close();
  });

  it('GET /api/v1 returns namespace status', async () => {
    const app = createApp(config);
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toEqual({
      api: 'Syntrophos API',
      version: 'v1',
      status: 'active',
    });
    await app.close();
  });
});
