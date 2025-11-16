import { autoAssignmentService, AutoAssignmentResult } from './autoAssignmentService';
import { queryRepository } from '../repositories/queryRepository';
import { logger } from '../utils/logger';

export interface AssignmentStats {
  total: number;
  assigned: number;
  unassigned: number;
  byTeam: Record<string, number>;
  errors: number;
}

export interface BatchAssignmentResult {
  processed: number;
  assigned: number;
  skipped: number;
  errors: number;
  results: Array<{
    queryId: string;
    success: boolean;
    teamName?: string;
    error?: string;
  }>;
}

export const assignmentUtility = {
  /**
   * Assign a single query to a team
   */
  async assignQuery(queryId: string): Promise<AutoAssignmentResult> {
    logger.info({ queryId }, 'Manual assignment triggered');
    return await autoAssignmentService.processQuery(queryId);
  },

  /**
   * Assign all unassigned queries to teams
   */
  async assignAllUnassigned(): Promise<BatchAssignmentResult> {
    logger.info('Starting batch assignment of all unassigned queries');

    const allQueries = await queryRepository.list();
    const unassignedQueries = allQueries.filter((q: any) => !q.teamId);

    logger.info({ total: allQueries.length, unassigned: unassignedQueries.length }, 'Found unassigned queries');

    const results: BatchAssignmentResult['results'] = [];
    let assigned = 0;
    let skipped = 0;
    let errors = 0;

    for (const query of unassignedQueries) {
      try {
        const result = await autoAssignmentService.processQuery(query.id);
        
        if (result.assignment.teamId) {
          assigned++;
          results.push({
            queryId: query.id,
            success: true,
            teamName: result.assignment.teamName,
          });
        } else {
          skipped++;
          results.push({
            queryId: query.id,
            success: false,
            error: 'No team assigned',
          });
        }
      } catch (error: any) {
        errors++;
        logger.error({ queryId: query.id, error }, 'Failed to assign query');
        results.push({
          queryId: query.id,
          success: false,
          error: error?.message || 'Unknown error',
        });
      }
    }

    logger.info(
      { processed: unassignedQueries.length, assigned, skipped, errors },
      'Batch assignment complete'
    );

    return {
      processed: unassignedQueries.length,
      assigned,
      skipped,
      errors,
      results,
    };
  },

  /**
   * Re-assign a query (even if already assigned)
   */
  async reassignQuery(queryId: string): Promise<AutoAssignmentResult> {
    logger.info({ queryId }, 'Re-assignment triggered');
    return await autoAssignmentService.processQuery(queryId);
  },

  /**
   * Get assignment statistics
   */
  async getAssignmentStats(): Promise<AssignmentStats> {
    const queries = await queryRepository.list();
    
    const stats: AssignmentStats = {
      total: queries.length,
      assigned: 0,
      unassigned: 0,
      byTeam: {},
      errors: 0,
    };

    for (const query of queries as any[]) {
      if (query.teamId && query.team?.name) {
        stats.assigned++;
        const teamName = query.team.name;
        stats.byTeam[teamName] = (stats.byTeam[teamName] || 0) + 1;
      } else {
        stats.unassigned++;
      }
    }

    return stats;
  },

  /**
   * Assign queries by filter criteria
   */
  async assignByFilter(filters: {
    status?: string;
    priority?: string;
    channel?: string;
    unassignedOnly?: boolean;
  }): Promise<BatchAssignmentResult> {
    logger.info({ filters }, 'Starting filtered assignment');

    const allQueries = await queryRepository.list();
    
    let filteredQueries = allQueries.filter((q: any) => {
      if (filters.unassignedOnly && q.teamId) {
        return false;
      }
      if (filters.status && q.status !== filters.status) {
        return false;
      }
      if (filters.priority && q.priority !== filters.priority) {
        return false;
      }
      if (filters.channel && q.channel !== filters.channel) {
        return false;
      }
      return true;
    });

    logger.info({ total: allQueries.length, filtered: filteredQueries.length }, 'Filtered queries');

    const results: BatchAssignmentResult['results'] = [];
    let assigned = 0;
    let skipped = 0;
    let errors = 0;

    for (const query of filteredQueries) {
      try {
        const result = await autoAssignmentService.processQuery(query.id);
        
        if (result.assignment.teamId) {
          assigned++;
          results.push({
            queryId: query.id,
            success: true,
            teamName: result.assignment.teamName,
          });
        } else {
          skipped++;
          results.push({
            queryId: query.id,
            success: false,
            error: 'No team assigned',
          });
        }
      } catch (error: any) {
        errors++;
        logger.error({ queryId: query.id, error }, 'Failed to assign query');
        results.push({
          queryId: query.id,
          success: false,
          error: error?.message || 'Unknown error',
        });
      }
    }

    return {
      processed: filteredQueries.length,
      assigned,
      skipped,
      errors,
      results: results.slice(0, 100), // Limit results to first 100 for response size
    };
  },
};

