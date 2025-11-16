import httpClient from '../httpClient.js';

const chatPlatforms = ['live_chat', 'whatsapp', 'telegram', 'slack', 'discord'];

function getRandomPlatform() {
  return chatPlatforms[Math.floor(Math.random() * chatPlatforms.length)];
}

async function sendChatMessage({
  platform = getRandomPlatform(),
  conversationId = `chat-${Date.now()}`,
  userId = `user-${Math.floor(Math.random() * 10000)}`,
  message = 'Hello, I need help with my account.',
  subject,
  customerName,
  customerEmail,
  priority = 'medium',
} = {}) {
  try {
    const chatPayload = {
      platform,
      conversationId,
      userId,
      message,
      timestamp: new Date().toISOString(),
    };

    console.log(`💬 Sending ${platform} chat message from ${userId}`);

    const queryPayload = {
      channel: 'chat',
      subject: subject || `Chat message from ${platform}`,
      message,
      customerName: customerName || `Chat User ${userId}`,
      customerEmail: customerEmail || `${userId}@${platform}.com`,
      priority,
      tags: [{ name: platform, confidence: 1.0 }],
    };

    const response = await httpClient.post('/queries', queryPayload);
    console.log(`✅ Query created: ${response.data.data.id}`);

    return { chat: chatPayload, queryId: response.data.data.id };
  } catch (error) {
    console.error('❌ Error sending chat message:', error.message);
    throw error;
  }
}


export default sendChatMessage;
