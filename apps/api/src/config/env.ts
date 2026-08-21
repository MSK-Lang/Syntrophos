import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/syntrophos'),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173')
    .transform((val) => val.split(',').map((s) => s.trim()).filter(Boolean)),
  ENCRYPTION_MASTER_KEY: z.string().optional(),
});

export type RawEnvironment = z.input<typeof environmentSchema>;

export interface AppConfig {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly host: string;
  readonly port: number;
  readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  readonly databaseUrl: string;
  readonly corsAllowedOrigins: readonly string[];
  readonly encryptionMasterKey?: string | undefined;
}

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = environmentSchema.safeParse(environment);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `[${issue.path.join('.')}] ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${formatted}`);
  }

  return {
    nodeEnv: parsed.data.NODE_ENV,
    host: parsed.data.HOST,
    port: parsed.data.PORT,
    logLevel: parsed.data.LOG_LEVEL,
    databaseUrl: parsed.data.DATABASE_URL,
    corsAllowedOrigins: parsed.data.CORS_ALLOWED_ORIGINS,
    ...(parsed.data.ENCRYPTION_MASTER_KEY
      ? { encryptionMasterKey: parsed.data.ENCRYPTION_MASTER_KEY }
      : {}),
  };
}

