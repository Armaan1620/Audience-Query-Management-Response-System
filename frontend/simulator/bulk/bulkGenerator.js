// simulator/bulk/bulkGenerator.js
import { sendSocialWebhook } from '../social/sendSocialWebhook.js';
import { sendChatMessage } from '../chat/sendChatMessage.js';
import { sendCommunityWebhook } from '../community/sendCommunityWebhook.js';
import { sendEmail } from '../email/sendEmail.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate a random integer between min and max (inclusive).
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(list) {
  return list[randomInt(0, list.length - 1)];
}

function createRandomMessage() {
  const templates = [
    'Need help with my account settings.',
    'Question about billing and invoices.',
    'Feedback on the new feature release.',
    'Bug report: something is not working as expected.',
    'Pre-sales question about enterprise plans.',
  ];
  return randomChoice(templates);
}

/**
 * Creates a task that sends a random message through a random channel.
 */
function createRandomTask() {
  const channels = ['email', 'social', 'chat', 'community'];
  const channel = randomChoice(channels);
  const message = createRandomMessage();

  switch (channel) {
    case 'email':
      return async () => {
        await sendEmail({
          subject: 'Bulk Test Email from Simulator',
          text: message,
        });
      };

    case 'social':
      return async () => {
        await sendSocialWebhook({
          platform: randomChoice(['twitter', 'facebook', 'linkedin']),
          userId: `social-user-${randomInt(1, 1000)}`,
          message,
          metadata: { campaign: 'bulk-load-test' },
        });
      };

    case 'chat':
      return async () => {
        await sendChatMessage({
          platform: randomChoice(['live_chat', 'intercom', 'zendesk']),
          conversationId: `chat-conv-${randomInt(1, 5000)}`,
          userId: `chat-user-${randomInt(1, 1000)}`,
          message,
          metadata: { priority: randomChoice(['low', 'medium', 'high']) },
        });
      };

    case 'community':
    default:
      return async () => {
        await sendCommunityWebhook({
          platform: randomChoice(['discourse', 'vanilla', 'custom_forum']),
          threadId: `thread-${randomInt(1, 1000)}`,
          postId: `post-${randomInt(1, 10000)}`,
          title: `Bulk Test Topic #${randomInt(1, 10000)}`,
          content: message,
          userId: `community-user-${randomInt(1, 1000)}`,
          tags: ['bulk-test', 'simulator'],
          metadata: { category: randomChoice(['general', 'support', 'feedback']) },
        });
      };
  }
}

/**
 * Execute a list of async tasks with bounded concurrency.
 */
async function runWithConcurrency(tasks, concurrency) {
  let index = 0;

  async function worker(workerId) {
    while (index < tasks.length) {
      const currentIndex = index++;
      const task = tasks[currentIndex];

      try {
        await task();
      } catch (error) {
        console.error(`[BULK WORKER ${workerId}] Task ${currentIndex} failed:`, error.message);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i += 1) {
    workers.push(worker(i + 1));
  }

  await Promise.all(workers);
}

async function run() {
  const desiredCount =
    Number(process.env.BULK_MESSAGE_COUNT) ||
    Number(process.argv[2]) ||
    100;

  const count = Math.max(1, Math.min(desiredCount, 500));
  const concurrency =
    Number(process.env.BULK_CONCURRENCY) ||
    Number(process.argv[3]) ||
    10;

  console.log('[BULK GENERATOR START]', {
    totalMessages: count,
    concurrency,
  });

  const tasks = Array.from({ length: count }, () => createRandomTask());
  await runWithConcurrency(tasks, concurrency);

  console.log('[BULK GENERATOR COMPLETE]');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Executed directly via `node simulator/bulk/bulkGenerator.js`
  void run().catch((error) => {
    console.error('[BULK GENERATOR FATAL ERROR]', error.message);
    process.exitCode = 1;
  });
}

export { run };
