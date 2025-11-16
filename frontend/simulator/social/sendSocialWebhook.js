// simulator/social/sendSocialWebhook.js
import { httpClient, resolveUrl } from '../httpClient.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send a dummy social webhook payload to the ingestion service.
 */
async function sendSocialWebhook({
  platform = 'twitter',
  userId = 'social-user-123',
  message = 'Hello from Social Simulator!',
  subject = 'Social message from simulator',
  customerName = 'Social Simulator User',
  customerEmail,
  priority = 'medium',
  tags = [
    { name: 'simulator', confidence: 1 },
    { name: 'social', confidence: 0.9 },
  ],
  metadata = {},
} = {}) {
  const url = resolveUrl('SOCIAL_INGEST_URL', '/api/queries');

  const payload = {
    channel: 'social',
    subject,
    message,
    customerName,
    ...(customerEmail ? { customerEmail } : {}),
    priority,
    tags,
    metadata,
    simulatedAt: new Date().toISOString(),
    source: 'audience-simulator',
    original: {
      platform,
      userId,
    },
  };

  const response = await httpClient.post(url, payload);
  console.log('[SOCIAL WEBHOOK SENT]', {
    status: response.status,
    url,
  });

  return response.data;
}

async function run() {
  try {
    await sendSocialWebhook();
  } catch (error) {
    console.error('[SOCIAL SIMULATOR ERROR]', error.message);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Executed directly via `node simulator/social/sendSocialWebhook.js`
  void run();
}

export { sendSocialWebhook };
