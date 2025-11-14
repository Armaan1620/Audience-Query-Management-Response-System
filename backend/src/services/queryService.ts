import { queryRepository, QueryStatus } from '../repositories/queryRepository';
import { classificationQueue, priorityQueue, routingQueue } from '../queues/queueManager';

export const queryService = {
  async listQueries() {
    return queryRepository.list();
  },

  async getQuery(id: string) {
    const query = await queryRepository.findById(id);
    if (!query) {
      throw new Error('Query not found');
    }
    return query;
  },

  async createQuery(payload: {
    channel: string;
    subject: string;
    message: string;
    customerName?: string;
    customerEmail?: string;
    tags?: unknown;
    priority: string;
    status: string;
  }) {
    const created = await queryRepository.create(payload);
    await classificationQueue.add('classify', { queryId: created.id, message: created.message });
    await priorityQueue.add('score', { queryId: created.id, message: created.message });
    await routingQueue.add('route', { queryId: created.id });
    return created;
  },

  async updateStatus(id: string, status: QueryStatus) {
    return queryRepository.updateStatus(id, status);
  },
};
