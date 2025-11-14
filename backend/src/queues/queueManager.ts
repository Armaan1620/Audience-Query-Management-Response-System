import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/environment';
import { logger } from '../utils/logger';
import { aiService } from '../services/aiService';
import { queryRepository } from '../repositories/queryRepository';

const connection = new IORedis(env.redisUrl);

export const classificationQueue = new Queue('classification', { connection });
export const priorityQueue = new Queue('priority-scoring', { connection });
export const routingQueue = new Queue('routing', { connection });

new Worker(
  'classification',
  async (job) => {
    const { queryId, message } = job.data as { queryId: string; message: string };
    const insights = await aiService.classifyQuery(message);
    await queryRepository.updateAIInsights(queryId, insights);
    logger.info({ queryId }, 'Classification complete');
  },
  { connection }
);

new Worker(
  'priority-scoring',
  async (job) => {
    const { queryId, message } = job.data as { queryId: string; message: string };
    const urgency = message.toLowerCase().includes('urgent') ? 'urgent' : 'medium';
    await queryRepository.updatePriority(queryId, urgency);
    if (urgency === 'urgent') {
      await queryRepository.updateStatus(queryId, 'escalated');
    }
    logger.info({ queryId, urgency }, 'Priority scored');
  },
  { connection }
);

new Worker(
  'routing',
  async (job) => {
    const { queryId } = job.data as { queryId: string };
    // placeholder routing logic
    logger.info({ queryId }, 'Routing job processed');
  },
  { connection }
);

connection.on('error', (err) => logger.error({ err }, 'Redis error'));
