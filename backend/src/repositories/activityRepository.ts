import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';
import type { Prisma } from '@prisma/client';

export interface ActivityRecord {
  id: string;
  queryId: string;
  actorId?: string | null;
  action: string;
  metadata?: Prisma.InputJsonValue | null;
  createdAt: Date;
}

let useInMemory = false;
const memoryActivities: ActivityRecord[] = [];

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

function switchToInMemory(err: unknown) {
  if (!useInMemory) {
    useInMemory = true;
    logger.warn({ err }, 'Prisma database unavailable for activities, switching to in-memory activity store');
  }
}

export const activityRepository = {
  async log(queryId: string, action: string, metadata?: Prisma.InputJsonValue, actorId?: string) {
    const now = new Date();

    if (useInMemory) {
      const record: ActivityRecord = {
        id: generateId(),
        queryId,
        actorId: actorId ?? null,
        action,
        metadata: metadata ?? null,
        createdAt: now,
      };
      memoryActivities.push(record);
      return record;
    }

    try {
      const created = await prisma.queryActivity.create({
        data: {
          queryId,
          actorId: actorId ?? null,
          action,
          ...(metadata !== undefined && { metadata }),
        },
      });
      return created as unknown as ActivityRecord;
    } catch (err) {
      switchToInMemory(err);
      const record: ActivityRecord = {
        id: generateId(),
        queryId,
        actorId: actorId ?? null,
        action,
        metadata: metadata ?? null,
        createdAt: now,
      };
      memoryActivities.push(record);
      return record;
    }
  },

  async listByQuery(queryId: string) {
    if (useInMemory) {
      return memoryActivities
        .filter((a) => a.queryId === queryId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    try {
      const items = await prisma.queryActivity.findMany({
        where: { queryId },
        orderBy: { createdAt: 'asc' },
      });
      return items as unknown as ActivityRecord[];
    } catch (err) {
      switchToInMemory(err);
      return memoryActivities
        .filter((a) => a.queryId === queryId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
  },
};
