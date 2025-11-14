import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/environment';
import { logger } from '../utils/logger';
import { aiService } from '../services/aiService';
import { queryRepository } from '../repositories/queryRepository';

const connection = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

export const classificationQueue = new Queue('classification', { connection });
export const priorityQueue = new Queue('priority-scoring', { connection });
export const routingQueue = new Queue('routing', { connection });

new Worker(
  'classification',
  async (job) => {
    const { queryId, message } = job.data as { queryId: string; message: string };

    const insights = await aiService.classifyQuery(message);

    // Derive tags from AI insights (auto-tagging)
    const tags = [
      { name: insights.category, confidence: insights.confidence },
      { name: `sentiment:${insights.sentiment}`, confidence: insights.confidence },
      { name: `urgency:${insights.urgency}`, confidence: insights.confidence },
    ];

    // Persist structured JSON for insights and tags
    await queryRepository.updateAIInsights(queryId, insights as any);
    await queryRepository.updateTags(queryId, tags as any);

    logger.info({ queryId }, 'Classification and tagging complete');
  },
  { connection }
);

new Worker(
  'priority-scoring',
  async (job) => {
    const { queryId, message } = job.data as { queryId: string; message: string };

    // Use simple heuristics based on message content for now
    const lower = message.toLowerCase();
    let urgency: string = 'medium';

    if (lower.includes('immediately') || lower.includes('asap') || lower.includes('critical')) {
      urgency = 'critical';
    } else if (lower.includes('urgent') || lower.includes('as soon as possible')) {
      urgency = 'high';
    }

    await queryRepository.updatePriority(queryId, urgency);

    if (urgency === 'high' || urgency === 'critical') {
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
