import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';
import { queryRepository } from '../repositories/queryRepository';
import { routingQueue } from '../queues/queueManager';

const SAMPLE_MESSAGES = [
  // Billing-related
  'I need help with my billing statement.',
  'My payment was charged twice, please refund.',
  'I want to cancel my subscription.',
  'Can you explain your refund policy?',
  'I have a billing question about my invoice.',
  'How do I update my payment method?',
  'I was charged incorrectly on my account.',
  'I need help with my subscription renewal.',
  
  // Technical/Bug-related
  'The website is not loading properly.',
  'I want to report a bug in the application.',
  'The app is crashing on my device.',
  'I\'m experiencing a technical error.',
  'The feature is broken and not working.',
  'I need help with integration setup.',
  'There\'s a problem with the API.',
  'The system is showing an error message.',
  
  // Account-related
  'I need help with my account settings.',
  'How do I reset my password?',
  'I\'m having trouble logging in.',
  'Can you help me with account verification?',
  'I have a security concern about my account.',
  'How do I set up two-factor authentication?',
  'I need help with account recovery.',
  'How do I delete my account?',
  
  // Sales-related
  'I want to upgrade my plan.',
  'Can you explain your pricing?',
  'I want to purchase the enterprise plan.',
  'Can you provide a product demo?',
  'I have questions about your sales process.',
  'I want to change my plan.',
  'How do I contact sales?',
  
  // Support/General
  'I need assistance with a technical issue.',
  'How do I contact customer support?',
  'I have questions about your service.',
  'Can you help me with shipping options?',
  'I need to change my delivery address.',
  'What are your return policies?',
  'I want to provide feedback.',
  'I have a feature request.',
  'Can you provide documentation?',
  'I need help with troubleshooting.',
  'Can you help me with setup?',
];

const channels = ['email', 'social', 'chat', 'community'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses = ['new', 'in_progress', 'escalated', 'resolved', 'closed'];

function getRandomItem<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  const item = array[index];
  if (item === undefined) {
    throw new Error('Array is empty');
  }
  return item;
}

function generateCustomerEmail(channel: string, index: number): string {
  const domains = {
    email: 'example.com',
    social: 'social.com',
    chat: 'chat.com',
    community: 'community.com',
  };
  return `customer${index}@${domains[channel as keyof typeof domains] || 'example.com'}`;
}

async function generateDummyQueries(count: number = 100) {
  try {
    logger.info({ count }, 'Generating dummy queries...');

    let createdCount = 0;
    const batchSize = 50; // Process in batches to avoid overwhelming the system

    for (let batchStart = 0; batchStart < count; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, count);
      const batchPromises = [];

      for (let i = batchStart; i < batchEnd; i++) {
        const channel = getRandomItem(channels);
        const message = getRandomItem(SAMPLE_MESSAGES);
        const priority = getRandomItem(priorities);
        const status = getRandomItem(statuses);

        const queryData = {
          channel,
          subject: `Query ${i + 1}: ${message.substring(0, 50)}`,
          message,
          customerName: `Customer ${i + 1}`,
          customerEmail: generateCustomerEmail(channel, i),
          tags: [
            { name: channel, confidence: 0.9 },
            { name: priority, confidence: 0.8 },
          ] as any,
          priority,
          status,
        };

        // Use repository which has in-memory fallback
        batchPromises.push(
          queryRepository.create(queryData).then(async (created) => {
            createdCount++;
            // Trigger team assignment via routing queue
            try {
              await routingQueue.add('route', { queryId: created.id });
            } catch (err) {
              logger.warn({ queryId: created.id, error: err }, 'Failed to add routing job');
            }
          }).catch((err) => {
            logger.warn({ index: i, error: err }, `Failed to create query ${i + 1}`);
          })
        );
      }

      await Promise.all(batchPromises);
      
      // Log progress for large batches
      if (count > 100) {
        logger.info({ progress: `${batchEnd}/${count}` }, 'Batch progress');
      }
    }

    logger.info({ imported: createdCount }, 'Dummy queries generated successfully');
    console.log(`✅ Generated ${createdCount} dummy queries`);
    return createdCount;
  } catch (error) {
    logger.error({ error }, 'Error generating dummy queries');
    throw error;
  }
}

if (require.main === module) {
  const count = Number(process.argv[2]) || 100;
  generateDummyQueries(count)
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('❌ Generation failed:', error);
      await prisma.$disconnect();
      process.exit(1);
    });
}

export { generateDummyQueries };

