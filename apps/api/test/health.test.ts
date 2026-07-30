import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

const app = createApp({
  host: '127.0.0.1',
  port: 3000,
  logLevel: 'info',
});

afterAll(async () => {
  await app.close();
});

describe('GET /health', () => {
  it('reports that the API is available', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
