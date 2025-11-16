import { teamRepository } from '../repositories/teamRepository';
import { queryRepository } from '../repositories/queryRepository';
import { logger } from '../utils/logger';

export interface TeamWithQueries {
  id: string;
  name: string;
  description?: string | null;
  queries: any[];
  queryCount: number;
  queriesByStatus: Record<string, number>;
  queriesByPriority: Record<string, number>;
}

export const teamsService = {
  async getTeamsWithQueries(): Promise<TeamWithQueries[]> {
    logger.info('Fetching teams with queries');

    const teams = await teamRepository.findAll();
    const allQueries = await queryRepository.list();

    // Define all expected teams
    const expectedTeams = [
      { name: 'Support Team', description: 'General customer support team' },
      { name: 'Billing Team', description: 'Billing and payment inquiries' },
      { name: 'Technical Team', description: 'Technical support and bug reports' },
      { name: 'Operations Team', description: 'Operations and process management' },
      { name: 'Product Team', description: 'Product inquiries and feature requests' },
      { name: 'Escalations Team', description: 'Escalated issues and complex problems' },
    ];

    const teamsWithQueries: TeamWithQueries[] = [];

    // Process each expected team (even if it doesn't exist in DB yet)
    for (const expectedTeam of expectedTeams) {
      // Find the team in the database
      const team = teams.find((t) => t.name === expectedTeam.name);
      
      // Get queries for this team
      const teamQueries = (allQueries as any[]).filter(
        (q) => q.teamId === team?.id
      );

      const queriesByStatus: Record<string, number> = {};
      const queriesByPriority: Record<string, number> = {};

      for (const query of teamQueries) {
        const status = query.status ?? 'unknown';
        queriesByStatus[status] = (queriesByStatus[status] ?? 0) + 1;

        const priority = query.priority ?? 'unknown';
        queriesByPriority[priority] = (queriesByPriority[priority] ?? 0) + 1;
      }

      teamsWithQueries.push({
        id: team?.id || `expected-${expectedTeam.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: expectedTeam.name,
        description: expectedTeam.description,
        queries: teamQueries,
        queryCount: teamQueries.length,
        queriesByStatus,
        queriesByPriority,
      });
    }

    // Also include any other teams that exist in DB but aren't in the expected list
    for (const team of teams) {
      if (!expectedTeams.find((et) => et.name === team.name)) {
        const teamQueries = (allQueries as any[]).filter(
          (q) => q.teamId === team.id
        );

        const queriesByStatus: Record<string, number> = {};
        const queriesByPriority: Record<string, number> = {};

        for (const query of teamQueries) {
          const status = query.status ?? 'unknown';
          queriesByStatus[status] = (queriesByStatus[status] ?? 0) + 1;

          const priority = query.priority ?? 'unknown';
          queriesByPriority[priority] = (queriesByPriority[priority] ?? 0) + 1;
        }

        teamsWithQueries.push({
          id: team.id,
          name: team.name,
          description: team.description,
          queries: teamQueries,
          queryCount: teamQueries.length,
          queriesByStatus,
          queriesByPriority,
        });
      }
    }

    // Add unassigned queries as a separate "team"
    const unassignedQueries = (allQueries as any[]).filter(
      (q) => !q.teamId
    );

    if (unassignedQueries.length > 0) {
      const queriesByStatus: Record<string, number> = {};
      const queriesByPriority: Record<string, number> = {};

      for (const query of unassignedQueries) {
        const status = query.status ?? 'unknown';
        queriesByStatus[status] = (queriesByStatus[status] ?? 0) + 1;

        const priority = query.priority ?? 'unknown';
        queriesByPriority[priority] = (queriesByPriority[priority] ?? 0) + 1;
      }

      teamsWithQueries.push({
        id: 'unassigned',
        name: 'Unassigned',
        description: 'Queries not yet assigned to any team',
        queries: unassignedQueries,
        queryCount: unassignedQueries.length,
        queriesByStatus,
        queriesByPriority,
      });
    }

    logger.info(
      { teamCount: teamsWithQueries.length },
      'Fetched teams with queries'
    );

    return teamsWithQueries.sort((a, b) => {
      // Sort unassigned to the end
      if (a.id === 'unassigned') return 1;
      if (b.id === 'unassigned') return -1;
      return a.name.localeCompare(b.name);
    });
  },
};

