import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export type QueryStatus = 'new' | 'in_progress' | 'escalated' | 'resolved' | 'closed';

export const queryRepository = {
  async list() {
    return prisma.query.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: true,
        team: true,
      },
    });
  },

  async findById(id: string) {
    return prisma.query.findUnique({
      where: { id },
      include: {
        assignee: true,
        team: true,
      },
    });
  },

  async create(data: {
    channel: string;
    subject: string;
    message: string;
    customerName?: string;
    customerEmail?: string;
    tags?: Prisma.JsonValue;
    priority: string;
    status: string;
  }) {
    return prisma.query.create({
      data,
      include: {
        assignee: true,
        team: true,
      },
    });
  },

  async updateStatus(id: string, status: QueryStatus) {
    return prisma.query.update({
      where: { id },
      data: { status },
      include: {
        assignee: true,
        team: true,
      },
    });
  },

  async updatePriority(id: string, priority: string) {
    return prisma.query.update({
      where: { id },
      data: { priority },
      include: {
        assignee: true,
        team: true,
      },
    });
  },

  async assign(id: string, assignmentId?: string, teamId?: string) {
    return prisma.query.update({
      where: { id },
      data: { assignmentId, teamId },
      include: {
        assignee: true,
        team: true,
      },
    });
  },

  async updateAIInsights(id: string, aiInsights: Prisma.InputJsonValue) {
    return prisma.query.update({
      where: { id },
      data: { aiInsights },
      include: {
        assignee: true,
        team: true,
      },
    });
  },
};
