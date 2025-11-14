import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export type QueryStatus = 'new' | 'in_progress' | 'escalated' | 'resolved' | 'closed';

// In-memory fallback store when the database is unavailable (e.g. invalid credentials)
export interface InMemoryQuery {
  id: string;
  channel: string;
  subject: string;
  message: string;
  customerName?: string | null | undefined;
  customerEmail?: string | null | undefined;
  tags: any;
  priority: string;
  status: string;
  assignmentId?: string | null;
  teamId?: string | null;
  assignee?: any;
  team?: any;
  aiInsights?: any;
  createdAt: Date;
  updatedAt: Date;
}

let useInMemory = false;
const memoryQueries: InMemoryQuery[] = [];

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

function switchToInMemory(err: unknown) {
  if (!useInMemory) {
    useInMemory = true;
    logger.warn({ err }, 'Prisma database unavailable, switching to in-memory query store');
  }
}

export const queryRepository = {
  async list() {
    if (useInMemory) {
      return memoryQueries.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    try {
      return await prisma.query.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: true,
          team: true,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      return memoryQueries.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  },

  async findById(id: string) {
    if (useInMemory) {
      return memoryQueries.find((q) => q.id === id) ?? null;
    }

    try {
      return await prisma.query.findUnique({
        where: { id },
        include: {
          assignee: true,
          team: true,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      return memoryQueries.find((q) => q.id === id) ?? null;
    }
  },

  async create(data: {
    channel: string;
    subject: string;
    message: string;
    customerName?: string;
    customerEmail?: string;
    tags: Prisma.InputJsonValue;
    priority: string;
    status: string;
  }) {
    if (useInMemory) {
      const now = new Date();
      const created: InMemoryQuery = {
        id: generateId(),
        channel: data.channel,
        subject: data.subject,
        message: data.message,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        tags: data.tags,
        priority: data.priority,
        status: data.status,
        assignmentId: null,
        teamId: null,
        createdAt: now,
        updatedAt: now,
      };
      memoryQueries.unshift(created);
      return created;
    }

    try {
      return await prisma.query.create({
        data: {
          ...data,
          tags: data.tags,
        },
        include: {
          assignee: true,
          team: true,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      const now = new Date();
      const created: InMemoryQuery = {
        id: generateId(),
        channel: data.channel,
        subject: data.subject,
        message: data.message,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        tags: data.tags,
        priority: data.priority,
        status: data.status,
        assignmentId: null,
        teamId: null,
        createdAt: now,
        updatedAt: now,
      };
      memoryQueries.unshift(created);
      return created;
    }
  },

  async updateStatus(id: string, status: QueryStatus) {
    if (useInMemory) {
      const existing = memoryQueries.find((q) => q.id === id);
      if (!existing) return null;
      existing.status = status;
      existing.updatedAt = new Date();
      return existing;
    }

    try {
      return await prisma.query.update({
        where: { id },
        data: { status },
        include: {
          assignee: true,
          team: true,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      const existing = memoryQueries.find((q) => q.id === id);
      if (!existing) return null;
      existing.status = status;
      existing.updatedAt = new Date();
      return existing;
    }
  },

  async updatePriority(id: string, priority: string) {
    if (useInMemory) {
      const existing = memoryQueries.find((q) => q.id === id);
      if (!existing) return null;
      existing.priority = priority;
      existing.updatedAt = new Date();
      return existing;
    }

    try {
      return await prisma.query.update({
        where: { id },
        data: { priority },
        include: {
          assignee: true,
          team: true,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      const existing = memoryQueries.find((q) => q.id === id);
      if (!existing) return null;
      existing.priority = priority;
      existing.updatedAt = new Date();
      return existing;
    }
  },

  async updateTags(id: string, tags: Prisma.InputJsonValue) {
    if (useInMemory) {
      const existing = memoryQueries.find((q) => q.id === id);
      if (!existing) return null;
      existing.tags = tags;
      existing.updatedAt = new Date();
      return existing;
    }

    try {
      return await prisma.query.update({
        where: { id },
        data: { tags },
        include: {
          assignee: true,
          team: true,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      const existing = memoryQueries.find((q) => q.id === id);
      if (!existing) return null;
      existing.tags = tags;
      existing.updatedAt = new Date();
      return existing;
    }
  },

  async assign(id: string, assignmentId?: string, teamId?: string) {
    if (useInMemory) {
      const existing = memoryQueries.find((q) => q.id === id);
      if (!existing) return null;
      existing.assignmentId = assignmentId ?? null;
      existing.teamId = teamId ?? null;
      existing.updatedAt = new Date();
      return existing;
    }

    try {
      return await prisma.query.update({
        where: { id },
        data: {
          assignmentId: assignmentId ?? null,
          teamId: teamId ?? null,
        },
        include: {
          assignee: true,
          team: true,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      const existing = memoryQueries.find((q) => q.id === id);
      if (!existing) return null;
      existing.assignmentId = assignmentId ?? null;
      existing.teamId = teamId ?? null;
      existing.updatedAt = new Date();
      return existing;
    }
  },

  async updateAIInsights(id: string, aiInsights: Prisma.InputJsonValue) {
    if (useInMemory) {
      const existing = memoryQueries.find((q) => q.id === id);
      if (!existing) return null;
      existing.aiInsights = aiInsights;
      existing.updatedAt = new Date();
      return existing;
    }

    try {
      return await prisma.query.update({
        where: { id },
        data: { aiInsights },
        include: {
          assignee: true,
          team: true,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      const existing = memoryQueries.find((q) => q.id === id);
      if (!existing) return null;
      existing.aiInsights = aiInsights;
      existing.updatedAt = new Date();
      return existing;
    }
  },
};
