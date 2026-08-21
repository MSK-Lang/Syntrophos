import { createApp } from './app.js';
import { loadConfig } from './config/env.js';
import { createDb } from './db/index.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const dbInstance = createDb(config.databaseUrl);
  const app = createApp(config, dbInstance);

  async function shutdown(signal: string) {
    app.log.info({ signal }, 'Shutting down server gracefully...');
    try {
      await app.close();
      await dbInstance.close();
      app.log.info('Server and database connections closed cleanly.');
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  try {
    const address = await app.listen({ host: config.host, port: config.port });
    app.log.info({ address, env: config.nodeEnv }, 'Syntrophos API server started successfully');
  } catch (error: unknown) {
    app.log.error({ error }, 'Unable to start Syntrophos API server');
    process.exit(1);
  }
}

void main();
