// simulator/chat/sendChatMessage.js
import { httpClient, resolveUrl } from '../httpClient.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send a dummy chat message to the ingestion service.
 */
async function sendChatMessage({
  platform = 'live_chat',
  conversationId = 'chat-conv-001',
  userId = 'chat-user-456',
  message = 'Hello from Chat Simulator!',
  subject = 'Chat message from simulator',
  customerName = 'Chat Simulator User',
  customerEmail,
  priority = 'medium',
  tags = [
    { name: 'simulator', confidence: 1 },
    { name: 'chat', confidence: 0.9 },
  ],
  metadata = {},
} = {}) {
  const url = resolveUrl('CHAT_INGEST_URL', '/api/queries');

  const payload = {
    channel: 'chat',
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
      conversationId,
      userId,
    },
  };

  const response = await httpClient.post(url, payload);
  console.log('[CHAT MESSAGE SENT]', {
    status: response.status,
    url,
  });

  return response.data;
}

async function run() {
  try {
    await sendChatMessage();
  } catch (error) {
    console.error('[CHAT SIMULATOR ERROR]', error.message);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // Executed directly via `node simulator/chat/sendChatMessage.js`
  void run();
}

export { sendChatMessage };
