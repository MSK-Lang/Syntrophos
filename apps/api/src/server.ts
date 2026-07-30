import { createApp } from './app.js';
import { loadConfig } from './config/env.js';

const config = loadConfig();
const app = createApp(config);

async function start(): Promise<void> {
  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (error: unknown) {
    app.log.error({ error }, 'Unable to start API server');
    process.exitCode = 1;
  }
}

void start();
