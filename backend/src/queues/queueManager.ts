import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/environment';
import { logger } from '../utils/logger';
import { aiService } from '../services/aiService';
import { queryRepository } from '../repositories/queryRepository';
import { autoAssignmentService } from '../services/autoAssignmentService';
import { priorityDetectionService } from '../services/priorityDetectionService';

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

    try {
      const query = await queryRepository.findById(queryId);
      if (!query) {
        logger.warn({ queryId }, 'Query not found for priority scoring');
        return;
      }

      const priorityResult = priorityDetectionService.detectPriority(
        query.message,
        query.tags,
        query.aiInsights
      );

      await queryRepository.updatePriority(queryId, priorityResult.priority);

      logger.info(
        { queryId, priority: priorityResult.priority, reasons: priorityResult.reasons },
        'Priority scored'
      );
    } catch (error) {
      logger.error({ queryId, error }, 'Priority scoring failed');
      throw error;
    }
  },
  { connection }
);

new Worker(
  'routing',
  async (job) => {
    const { queryId } = job.data as { queryId: string };
    try {
      const result = await autoAssignmentService.processQuery(queryId);
      logger.info({ queryId, result }, 'Auto-assignment routing complete');
    } catch (error) {
      logger.error({ queryId, error }, 'Auto-assignment routing failed');
      throw error;
    }
  },
  { connection }
);

connection.on('error', (err) => logger.error({ err }, 'Redis error'));
