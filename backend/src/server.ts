import app from './app';
import { env } from './config/environment';
import { logger } from './utils/logger';
import './queues/queueManager';

app.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port}`);
});
