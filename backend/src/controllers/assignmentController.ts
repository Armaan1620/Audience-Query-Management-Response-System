import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, failure } from '../utils/apiResponse';
import { assignmentUtility } from '../services/assignmentUtility';
import { logger } from '../utils/logger';

export const assignmentController = {
  /**
   * Assign a specific query by ID
   * POST /api/assignment/assign/:queryId
   */
  assignQuery: asyncHandler(async (req: Request, res: Response) => {
    const { queryId } = req.params;

    if (!queryId) {
      return res.status(400).json(failure('Query ID is required'));
    }

    try {
      const result = await assignmentUtility.assignQuery(queryId);
      res.json(
        success(result, `Query assigned to ${result.assignment.teamName || 'team'}`)
      );
    } catch (error: any) {
      logger.error({ queryId, error }, 'Failed to assign query');
      res.status(500).json(failure(error?.message || 'Failed to assign query'));
    }
  }),

  /**
   * Assign all unassigned queries
   * POST /api/assignment/assign-all
   */
  assignAll: asyncHandler(async (_req: Request, res: Response) => {
    try {
      // Ensure teams exist before assignment
      try {
        const { seedTeams } = await import('../scripts/seedTeams');
        await seedTeams();
        logger.info('Teams seeded before assignment');
      } catch (seedError: any) {
        // If seeding fails, log but continue (teams might already exist)
        logger.warn({ error: seedError }, 'Team seeding failed or teams already exist');
      }

      const result = await assignmentUtility.assignAllUnassigned();
      res.json(
        success(
          result,
          `Processed ${result.processed} queries: ${result.assigned} assigned, ${result.errors} errors`
        )
      );
    } catch (error: any) {
      logger.error({ error }, 'Failed to assign all queries');
      res.status(500).json(failure(error?.message || 'Failed to assign queries'));
    }
  }),

  /**
   * Re-assign a query (even if already assigned)
   * POST /api/assignment/reassign/:queryId
   */
  reassignQuery: asyncHandler(async (req: Request, res: Response) => {
    const { queryId } = req.params;

    if (!queryId) {
      return res.status(400).json(failure('Query ID is required'));
    }

    try {
      const result = await assignmentUtility.reassignQuery(queryId);
      res.json(
        success(result, `Query re-assigned to ${result.assignment.teamName || 'team'}`)
      );
    } catch (error: any) {
      logger.error({ queryId, error }, 'Failed to re-assign query');
      res.status(500).json(failure(error?.message || 'Failed to re-assign query'));
    }
  }),

  /**
   * Get assignment statistics
   * GET /api/assignment/stats
   */
  getStats: asyncHandler(async (_req: Request, res: Response) => {
    try {
      const stats = await assignmentUtility.getAssignmentStats();
      res.json(success(stats));
    } catch (error: any) {
      logger.error({ error }, 'Failed to get assignment stats');
      res.status(500).json(failure(error?.message || 'Failed to get stats'));
    }
  }),

  /**
   * Assign queries by filter criteria
   * POST /api/assignment/assign-by-filter
   * Body: { status?, priority?, channel?, unassignedOnly? }
   */
  assignByFilter: asyncHandler(async (req: Request, res: Response) => {
    const filters = req.body as {
      status?: string;
      priority?: string;
      channel?: string;
      unassignedOnly?: boolean;
    };

    try {
      const result = await assignmentUtility.assignByFilter(filters);
      res.json(
        success(
          result,
          `Processed ${result.processed} queries: ${result.assigned} assigned, ${result.errors} errors`
        )
      );
    } catch (error: any) {
      logger.error({ filters, error }, 'Failed to assign by filter');
      res.status(500).json(failure(error?.message || 'Failed to assign queries'));
    }
  }),
};

