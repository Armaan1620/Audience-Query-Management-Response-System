import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

let useInMemory = false;
const memoryTeams: Team[] = [];

function switchToInMemory(err: unknown) {
  if (!useInMemory) {
    useInMemory = true;
    logger.warn({ err }, 'Prisma database unavailable, switching to in-memory team store');
  }
}

export const teamRepository = {
  async findAll() {
    if (useInMemory) {
      return memoryTeams;
    }

    try {
      return await prisma.team.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (err) {
      switchToInMemory(err);
      return memoryTeams;
    }
  },

  async findById(id: string) {
    if (useInMemory) {
      return memoryTeams.find((t) => t.id === id) ?? null;
    }

    try {
      return await prisma.team.findUnique({
        where: { id },
        include: {
          users: true,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      return memoryTeams.find((t) => t.id === id) ?? null;
    }
  },

  async findByName(name: string) {
    if (useInMemory) {
      return memoryTeams.find((t) => t.name.toLowerCase() === name.toLowerCase()) ?? null;
    }

    try {
      return await prisma.team.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
        },
        include: {
          users: true,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      return memoryTeams.find((t) => t.name.toLowerCase() === name.toLowerCase()) ?? null;
    }
  },

  async findAvailableUsers(teamId: string) {
    if (useInMemory) {
      return [];
    }

    try {
      return await prisma.user.findMany({
        where: {
          teamId,
          role: {
            in: ['agent', 'manager'],
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    } catch (err) {
      switchToInMemory(err);
      return [];
    }
  },

  async create(data: { name: string; description?: string }) {
    if (useInMemory) {
      const now = new Date();
      const newTeam: Team = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        name: data.name,
        description: data.description,
        createdAt: now,
        updatedAt: now,
      };
      memoryTeams.push(newTeam);
      return newTeam;
    }

    try {
      return await prisma.team.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });
    } catch (err) {
      switchToInMemory(err);
      const now = new Date();
      const newTeam: Team = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        name: data.name,
        description: data.description,
        createdAt: now,
        updatedAt: now,
      };
      memoryTeams.push(newTeam);
      return newTeam;
    }
  },
};

