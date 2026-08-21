import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config/env.js';

describe('Environment Configuration Loader', () => {
  it('loads valid environment variables with default values', () => {
    const config = loadConfig({
      NODE_ENV: 'test',
      PORT: '4000',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/syntrophos_test',
    });

    expect(config.nodeEnv).toBe('test');
    expect(config.port).toBe(4000);
    expect(config.host).toBe('127.0.0.1');
    expect(config.logLevel).toBe('info');
    expect(config.databaseUrl).toBe('postgresql://postgres:postgres@localhost:5432/syntrophos_test');
    expect(config.corsAllowedOrigins).toEqual(['http://localhost:3000', 'http://localhost:5173']);
  });

  it('correctly parses custom comma-separated CORS allowed origins', () => {
    const config = loadConfig({
      NODE_ENV: 'production',
      PORT: '8080',
      CORS_ALLOWED_ORIGINS: 'https://syntrophos.ai, https://app.syntrophos.ai',
    });

    expect(config.corsAllowedOrigins).toEqual([
      'https://syntrophos.ai',
      'https://app.syntrophos.ai',
    ]);
  });

  it('throws a descriptive error when required variables are invalid', () => {
    expect(() =>
      loadConfig({
        PORT: '99999', // Out of bounds port
        DATABASE_URL: 'not-a-url',
      }),
    ).toThrowError(/Invalid environment configuration/);
  });
});
