import { autoAssignmentService } from '../services/autoAssignmentService';
import { logger } from './logger';

export async function triggerAutoAssignment(queryId: string): Promise<void> {
  try {
    await autoAssignmentService.processQuery(queryId);
  } catch (error) {
    logger.error({ queryId, error }, 'Failed to trigger auto-assignment');
    throw error;
  }
}

export function shouldAutoAssign(status: string, priority: string): boolean {
  return status === 'new' && (priority === 'medium' || priority === 'low' || !priority);
}

