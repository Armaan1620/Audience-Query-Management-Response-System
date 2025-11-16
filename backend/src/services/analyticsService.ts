import { queryRepository } from '../repositories/queryRepository';

export interface AnalyticsSummary {
  totalQueries: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byChannel: Record<string, number>;
  byTeam: Record<string, number>;
  last30DaysCount: number;
  averageResolutionHours: number;
}

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    const queries = await queryRepository.list();
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byChannel: Record<string, number> = {};
    const byTeam: Record<string, number> = {};

    const now = new Date();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    let resolvedDurations: number[] = [];
    let last30DaysCount = 0;

    for (const q of queries as any[]) {
      const status = q.status ?? 'unknown';
      byStatus[status] = (byStatus[status] ?? 0) + 1;

      const priority = q.priority ?? 'unknown';
      byPriority[priority] = (byPriority[priority] ?? 0) + 1;

      const channel = q.channel ?? 'unknown';
      byChannel[channel] = (byChannel[channel] ?? 0) + 1;

      // Count by team
      const teamName = q.team?.name ?? 'Unassigned';
      byTeam[teamName] = (byTeam[teamName] ?? 0) + 1;

      const createdAt = new Date(q.createdAt);
      const updatedAt = new Date(q.updatedAt ?? q.createdAt);

      if (now.getTime() - createdAt.getTime() <= THIRTY_DAYS_MS) {
        last30DaysCount += 1;
      }

      if (status === 'resolved' || status === 'closed') {
        const hours = (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hours >= 0) {
          resolvedDurations.push(hours);
        }
      }
    }

    const averageResolutionHours =
      resolvedDurations.length > 0
        ? resolvedDurations.reduce((sum, h) => sum + h, 0) / resolvedDurations.length
        : 0;

    return {
      totalQueries: queries.length,
      byStatus,
      byPriority,
      byChannel,
      byTeam,
      last30DaysCount,
      averageResolutionHours,
    };
  },
};