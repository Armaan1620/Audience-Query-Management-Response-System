import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';
import { queryRepository } from '../repositories/queryRepository';

async function importDummyQueries() {
  try {
    logger.info('Fetching all queries from repository...');

    const queries = await queryRepository.list();

    if (queries.length === 0) {
      logger.info('No queries found to import');
      return;
    }

    logger.info({ count: queries.length }, 'Found queries to import');

    const queriesToImport = queries.map((q: any) => ({
      channel: q.channel,
      subject: q.subject,
      message: q.message,
      customerName: q.customerName || null,
      customerEmail: q.customerEmail || null,
      tags: q.tags || [],
      priority: q.priority || 'medium',
      status: q.status || 'new',
    }));

    const result = await prisma.query.createMany({
      data: queriesToImport,
      skipDuplicates: true,
    });

    logger.info({ imported: result.count }, 'Queries imported successfully');
    console.log(`✅ Imported ${result.count} queries to database`);
  } catch (error) {
    logger.error({ error }, 'Error importing queries');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  importDummyQueries()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

export { importDummyQueries };

