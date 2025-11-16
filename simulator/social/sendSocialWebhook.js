import httpClient from '../httpClient.js';

const platforms = ['instagram', 'twitter', 'facebook'];

function getRandomPlatform() {
  return platforms[Math.floor(Math.random() * platforms.length)];
}

function generateRandomUser(platform) {
  const usernames = {
    instagram: ['@user123', '@coolguy', '@photographer', '@traveler', '@foodie'],
    twitter: ['@tweeter', '@newsreader', '@techfan', '@sportsfan', '@musician'],
    facebook: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown'],
  };

  const names = usernames[platform] || usernames.twitter;
  return names[Math.floor(Math.random() * names.length)];
}

async function sendSocialWebhook({
  platform = getRandomPlatform(),
  user = generateRandomUser(platform),
  message = 'This is a test social media message.',
  timestamp = new Date().toISOString(),
  subject,
  priority = 'medium',
} = {}) {
  try {
    const webhookPayload = {
      platform,
      user,
      message,
      timestamp,
    };

    console.log(`📱 Sending ${platform} webhook for user: ${user}`);

    const queryPayload = {
      channel: 'social',
      subject: subject || `${platform} message from ${user}`,
      message,
      customerName: user,
      customerEmail: `${user.replace(/[@\s]/g, '')}@${platform}.com`,
      priority,
      tags: [{ name: platform, confidence: 1.0 }],
    };

    const response = await httpClient.post('/queries', queryPayload);
    console.log(`✅ Query created: ${response.data.data.id}`);

    return { webhook: webhookPayload, queryId: response.data.data.id };
  } catch (error) {
    console.error('❌ Error sending social webhook:', error.message);
    throw error;
  }
}


export default sendSocialWebhook;
