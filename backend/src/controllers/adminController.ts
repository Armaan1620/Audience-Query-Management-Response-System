import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { success, failure } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const adminController = {
  reset: asyncHandler(async (_req: Request, res: Response) => {
    try {
      await prisma.queryActivity.deleteMany();
      await prisma.query.deleteMany();
      await prisma.user.deleteMany();
      await prisma.team.deleteMany();

      logger.info('Database reset completed');

      res.json(success(null, 'All data has been reset'));
    } catch (error) {
      logger.error({ error }, 'Error resetting database');
      res.status(500).json(failure('Failed to reset database'));
    }
  }),

  importDummyQueries: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { count = 100 } = req.body as { count?: number };
      
      if (count < 1 || count > 10000) {
        return res.status(400).json(failure('Count must be between 1 and 10000'));
      }

      // Ensure teams are seeded before generating queries
      try {
        const { seedTeams } = await import('../scripts/seedTeams');
        await seedTeams();
        logger.info('Teams seeded successfully');
      } catch (seedError: any) {
        // If seeding fails, log but continue (teams might already exist)
        logger.warn({ error: seedError }, 'Team seeding failed or teams already exist');
      }

      const { generateDummyQueries } = await import('../scripts/generateDummyQueries');
      const imported = await generateDummyQueries(count);

      res.json(success({ imported }, `Successfully generated ${imported} dummy queries`));
    } catch (error: any) {
      logger.error({ error, message: error?.message, stack: error?.stack }, 'Error generating dummy queries');
      
      // Check if it's a database authentication error
      const errorMessage = error?.message || '';
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('database credentials')) {
        return res.status(500).json(
          failure('Database connection failed. Please check your DATABASE_URL in .env file. Queries are being stored in memory.')
        );
      }
      
      res.status(500).json(failure(errorMessage || 'Failed to generate dummy queries'));
    }
  }),

  seedTeams: asyncHandler(async (_req: Request, res: Response) => {
    try {
      const { seedTeams } = await import('../scripts/seedTeams');
      await seedTeams();
      res.json(success(null, 'Teams seeded successfully'));
    } catch (error: any) {
      logger.error({ error }, 'Error seeding teams');
      res.status(500).json(failure(error?.message || 'Failed to seed teams'));
    }
  }),
};

