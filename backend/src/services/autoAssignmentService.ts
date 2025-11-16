import { queryRepository, QueryStatus } from '../repositories/queryRepository';
import { activityRepository } from '../repositories/activityRepository';
import { teamAssignmentService, AssignmentResult } from './teamAssignmentService';
import { priorityDetectionService, Priority } from './priorityDetectionService';
import { statusManagementService } from './statusManagementService';
import { logger } from '../utils/logger';

export interface AutoAssignmentResult {
  queryId: string;
  priority: Priority;
  status: QueryStatus;
  assignment: AssignmentResult;
  statusTransition?: {
    from: QueryStatus;
    to: QueryStatus;
    reason: string;
  } | undefined;
}

export const autoAssignmentService = {
  async processQuery(queryId: string): Promise<AutoAssignmentResult> {
    logger.info({ queryId }, 'Starting auto-assignment process');

    const query = await queryRepository.findById(queryId);
    if (!query) {
      throw new Error(`Query ${queryId} not found`);
    }

    const currentStatus = query.status as QueryStatus;
    const currentPriority = query.priority as Priority;

    const priorityResult = priorityDetectionService.detectPriority(
      query.message,
      query.tags,
      query.aiInsights
    );

    const assignmentResult = await teamAssignmentService.assignTeam(
      query.tags,
      query.channel,
      query.message,
      query.aiInsights
    );

    const isAssigned = !!(assignmentResult.teamId || assignmentResult.userId);
    const initialStatus = statusManagementService.determineInitialStatus(
      priorityResult.priority,
      isAssigned
    );

    const statusTransition = statusManagementService.getStatusTransition(
      currentStatus,
      priorityResult.priority,
      isAssigned
    );

    const finalStatus = statusTransition?.to || initialStatus;

    await this.applyUpdates(queryId, {
      priority: priorityResult.priority,
      status: finalStatus,
      assignment: assignmentResult,
      statusTransition: statusTransition || undefined,
    });

    await this.logActivity(queryId, {
      priority: priorityResult.priority,
      assignment: assignmentResult,
      statusTransition: statusTransition || undefined,
      reasons: priorityResult.reasons,
    });

    logger.info(
      {
        queryId,
        priority: priorityResult.priority,
        status: finalStatus,
        teamId: assignmentResult.teamId,
        userId: assignmentResult.userId,
      },
      'Auto-assignment complete'
    );

    const result: AutoAssignmentResult = {
      queryId,
      priority: priorityResult.priority,
      status: finalStatus,
      assignment: assignmentResult,
    };

    if (statusTransition) {
      result.statusTransition = {
        from: statusTransition.from,
        to: statusTransition.to,
        reason: statusTransition.reason,
      };
    }

    return result;
  },

  async applyUpdates(
    queryId: string,
    updates: {
      priority: Priority;
      status: QueryStatus;
      assignment: AssignmentResult;
      statusTransition?: {
        from: QueryStatus;
        to: QueryStatus;
        reason: string;
        auto: boolean;
      } | undefined;
    }
  ) {
    const updatesToApply: Array<Promise<unknown>> = [];

    if (updates.priority) {
      updatesToApply.push(queryRepository.updatePriority(queryId, updates.priority));
    }

    if (updates.status) {
      updatesToApply.push(queryRepository.updateStatus(queryId, updates.status));
    }

    if (updates.assignment.teamId || updates.assignment.userId) {
      updatesToApply.push(
        queryRepository.assign(
          queryId,
          updates.assignment.userId,
          updates.assignment.teamId
        )
      );
    }

    await Promise.all(updatesToApply);
  },

  async logActivity(
    queryId: string,
    context: {
      priority: Priority;
      assignment: AssignmentResult;
      statusTransition?: {
        from: QueryStatus;
        to: QueryStatus;
        reason: string;
        auto: boolean;
      } | undefined;
      reasons: string[];
    }
  ) {
    const activities: Array<Promise<unknown>> = [];

    activities.push(
      activityRepository.log(queryId, 'priority_updated', {
        priority: context.priority,
        reasons: context.reasons,
        auto: true,
      })
    );

    if (context.assignment.teamId) {
      activities.push(
        activityRepository.log(queryId, 'team_assigned', {
          teamId: context.assignment.teamId,
          teamName: context.assignment.teamName,
          reason: context.assignment.reason,
          auto: true,
        })
      );
    }

    if (context.assignment.userId) {
      activities.push(
        activityRepository.log(queryId, 'user_assigned', {
          userId: context.assignment.userId,
          userName: context.assignment.userName,
          auto: true,
        })
      );
    }

    if (context.statusTransition) {
      activities.push(
        activityRepository.log(
          queryId,
          'status_changed',
          {
            from: context.statusTransition.from,
            to: context.statusTransition.to,
            reason: context.statusTransition.reason,
            auto: context.statusTransition.auto,
          },
          undefined
        )
      );
    }

    await Promise.all(activities);
  },
};

