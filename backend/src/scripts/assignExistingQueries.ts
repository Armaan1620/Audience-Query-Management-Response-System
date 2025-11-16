import { prisma } from '../config/prisma';
import { autoAssignmentService } from '../services/autoAssignmentService';
import { logger } from '../utils/logger';
import { queryRepository } from '../repositories/queryRepository';

async function assignExistingQueries() {
  try {
    logger.info('Starting assignment of existing queries...');

    const queries = await queryRepository.list();
    logger.info({ count: queries.length }, 'Found queries to process');

    let successCount = 0;
    let errorCount = 0;

    for (const query of queries) {
      try {
        if (!query.teamId) {
          logger.info({ queryId: query.id, subject: query.subject }, 'Processing query');
          const result = await autoAssignmentService.processQuery(query.id);
          logger.info(
            {
              queryId: query.id,
              teamId: result.assignment.teamId,
              teamName: result.assignment.teamName,
              priority: result.priority,
              status: result.status,
            },
            'Query assigned'
          );
          successCount++;
        } else {
          logger.debug({ queryId: query.id }, 'Query already assigned, skipping');
        }
      } catch (error) {
        logger.error({ queryId: query.id, error }, 'Failed to assign query');
        errorCount++;
      }
    }

    logger.info(
      { total: queries.length, success: successCount, errors: errorCount },
      'Assignment complete'
    );
  } catch (error) {
    logger.error({ error }, 'Error assigning queries');
    throw error;
  }
}

if (require.main === module) {
  assignExistingQueries()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, 'Assignment failed');
      process.exit(1);
    });
}

export { assignExistingQueries };

