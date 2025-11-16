import httpClient from '../httpClient.js';

const communityTypes = ['forum', 'reddit', 'discord', 'slack', 'discourse'];

function getRandomType() {
  return communityTypes[Math.floor(Math.random() * communityTypes.length)];
}

function generateRandomUsername() {
  const prefixes = ['user', 'member', 'contributor', 'helper', 'moderator'];
  const suffixes = Math.floor(Math.random() * 10000);
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes}`;
}

async function sendCommunityWebhook({
  type = getRandomType(),
  username = generateRandomUsername(),
  message = 'I have a question about the product.',
  threadId = `thread-${Date.now()}`,
  subject,
  priority = 'medium',
} = {}) {
  try {
    const webhookPayload = {
      type,
      username,
      message,
      threadId,
      timestamp: new Date().toISOString(),
    };

    console.log(`🌐 Sending ${type} community webhook from ${username}`);

    const queryPayload = {
      channel: 'community',
      subject: subject || `${type} post from ${username}`,
      message,
      customerName: username,
      customerEmail: `${username}@${type}.com`,
      priority,
      tags: [{ name: type, confidence: 1.0 }],
    };

    const response = await httpClient.post('/queries', queryPayload);
    console.log(`✅ Query created: ${response.data.data.id}`);

    return { webhook: webhookPayload, queryId: response.data.data.id };
  } catch (error) {
    console.error('❌ Error sending community webhook:', error.message);
    throw error;
  }
}


export default sendCommunityWebhook;
