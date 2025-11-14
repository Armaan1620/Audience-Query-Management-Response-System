import { Prisma } from '@prisma/client';
import { queryRepository, QueryStatus } from '../repositories/queryRepository';
import { activityRepository } from '../repositories/activityRepository';
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
    tags: Prisma.InputJsonValue;
    priority: string;
    status: string;
  }) {
    const created = await queryRepository.create(payload);

    await activityRepository.log(created.id, 'created', {
      channel: created.channel,
      priority: created.priority,
      status: created.status,
    });

    await classificationQueue.add('classify', { queryId: created.id, message: created.message });
    await priorityQueue.add('score', { queryId: created.id, message: created.message });
    await routingQueue.add('route', { queryId: created.id });
    return created;
  },

  async updateStatus(id: string, status: QueryStatus, actorId?: string, reason?: string) {
    const updated = await queryRepository.updateStatus(id, status);
    if (!updated) {
      throw new Error('Query not found');
    }
    await activityRepository.log(
      id,
      'status_changed',
      {
        status,
        reason,
      },
      actorId
    );
    return updated;
  },

  async assignQuery(id: string, assignmentId?: string, teamId?: string, actorId?: string) {
    const updated = await queryRepository.assign(id, assignmentId, teamId);
    if (!updated) {
      throw new Error('Query not found');
    }
    await activityRepository.log(
      id,
      'assigned',
      {
        assignmentId: assignmentId ?? null,
        teamId: teamId ?? null,
      },
      actorId
    );
    return updated;
  },

  async listActivities(id: string) {
    return activityRepository.listByQuery(id);
  },
};
