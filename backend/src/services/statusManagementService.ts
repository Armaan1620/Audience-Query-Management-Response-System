import { QueryStatus } from '../repositories/queryRepository';
import { Priority } from './priorityDetectionService';
import { logger } from '../utils/logger';

export interface StatusTransition {
  from: QueryStatus;
  to: QueryStatus;
  reason: string;
  auto: boolean;
}

const PRIORITY_TO_STATUS_MAP: Record<Priority, QueryStatus> = {
  urgent: 'escalated',
  high: 'escalated',
  medium: 'new',
  low: 'new',
};

const STATUS_WORKFLOW: Record<QueryStatus, QueryStatus[]> = {
  new: ['in_progress', 'escalated', 'resolved', 'closed'],
  in_progress: ['escalated', 'resolved', 'closed'],
  escalated: ['in_progress', 'resolved', 'closed'],
  resolved: ['closed', 'in_progress'],
  closed: [],
};

export const statusManagementService = {
  determineInitialStatus(priority: Priority, isAssigned: boolean): QueryStatus {
    if (priority === 'urgent' || priority === 'high') {
      return 'escalated';
    }

    if (isAssigned) {
      return 'in_progress';
    }

    return 'new';
  },

  canTransition(from: QueryStatus, to: QueryStatus): boolean {
    const allowed = STATUS_WORKFLOW[from];
    return allowed.includes(to);
  },

  getStatusTransition(
    currentStatus: QueryStatus,
    priority: Priority,
    isAssigned: boolean,
    isResolved: boolean = false
  ): StatusTransition | null {
    if (isResolved && currentStatus !== 'resolved' && currentStatus !== 'closed') {
      return {
        from: currentStatus,
        to: 'resolved',
        reason: 'Query marked as resolved',
        auto: false,
      };
    }

    if (priority === 'urgent' && currentStatus !== 'escalated') {
      return {
        from: currentStatus,
        to: 'escalated',
        reason: 'Priority upgraded to urgent',
        auto: true,
      };
    }

    if (priority === 'high' && currentStatus === 'new') {
      return {
        from: currentStatus,
        to: 'escalated',
        reason: 'High priority query requires escalation',
        auto: true,
      };
    }

    if (isAssigned && currentStatus === 'new') {
      return {
        from: currentStatus,
        to: 'in_progress',
        reason: 'Query assigned to team/user',
        auto: true,
      };
    }

    return null;
  },

  shouldAutoEscalate(priority: Priority, currentStatus: QueryStatus): boolean {
    if (priority === 'urgent' && currentStatus !== 'escalated') {
      return true;
    }

    if (priority === 'high' && currentStatus === 'new') {
      return true;
    }

    return false;
  },

  logStatusTransition(
    queryId: string,
    transition: StatusTransition,
    metadata?: Record<string, unknown>
  ) {
    logger.info(
      {
        queryId,
        from: transition.from,
        to: transition.to,
        reason: transition.reason,
        auto: transition.auto,
        ...metadata,
      },
      'Status transition'
    );
  },
};

