import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const environmentSchema = z.object({
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export interface AppConfig {
  readonly host: string;
  readonly port: number;
  readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
}

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = environmentSchema.safeParse(environment);

  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }

  return {
    host: parsed.data.HOST,
    port: parsed.data.PORT,
    logLevel: parsed.data.LOG_LEVEL,
  };
}
