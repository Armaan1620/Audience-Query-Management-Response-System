import sendEmail from '../email/sendEmail.js';
import sendSocialWebhook from '../social/sendSocialWebhook.js';
import sendChatMessage from '../chat/sendChatMessage.js';
import sendCommunityWebhook from '../community/sendCommunityWebhook.js';

const SAMPLE_MESSAGES = [
  'I need help with my account settings.',
  'My order hasn\'t arrived yet, can you check?',
  'How do I reset my password?',
  'I want to cancel my subscription.',
  'The product I received is damaged.',
  'Can you explain your refund policy?',
  'I have a billing question.',
  'How do I update my payment method?',
  'I\'m having trouble logging in.',
  'Can you help me with shipping options?',
  'I need to change my delivery address.',
  'What are your return policies?',
  'I want to upgrade my plan.',
  'How do I contact customer support?',
  'I have a feature request.',
  'The website is not loading properly.',
  'I received a wrong item in my order.',
  'Can you help me with account verification?',
  'I need assistance with a technical issue.',
  'How do I track my order?',
  'I want to report a bug.',
  'Can you explain your pricing?',
  'I have questions about your service.',
  'How do I delete my account?',
  'I need help with integration setup.',
  'The app is crashing on my device.',
  'Can you provide documentation?',
  'I have a security concern.',
  'How do I export my data?',
  'I want to provide feedback.',
  'Can you help me with API access?',
  'I have a question about compliance.',
  'How do I set up two-factor authentication?',
  'I need help with data migration.',
  'Can you explain your privacy policy?',
  'I have a question about data retention.',
  'How do I configure notifications?',
  'I want to change my plan.',
  'Can you help me with customization?',
  'I have a question about your roadmap.',
  'How do I access my account history?',
  'I need help with troubleshooting.',
  'Can you provide training materials?',
  'I have a question about integrations.',
  'How do I manage team permissions?',
  'I want to request a feature.',
  'Can you help me with setup?',
  'I have a question about billing cycles.',
  'How do I contact sales?',
  'I need help with account recovery.',
];

function getRandomMessage() {
  return SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];
}

function getRandomPriority() {
  const priorities = ['low', 'medium', 'high', 'urgent'];
  return priorities[Math.floor(Math.random() * priorities.length)];
}

function getRandomChannel() {
  const channels = ['email', 'social', 'chat', 'community'];
  return channels[Math.floor(Math.random() * channels.length)];
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateBulkMessages({ count = 100, delayMs = 100 } = {}) {
  const results = {
    email: 0,
    social: 0,
    chat: 0,
    community: 0,
    errors: 0,
    total: 0,
  };

  console.log(`🚀 Generating ${count} messages...\n`);

  for (let i = 0; i < count; i++) {
    try {
      const channel = getRandomChannel();
      const message = getRandomMessage();
      const priority = getRandomPriority();

      switch (channel) {
        case 'email':
          await sendEmail({
            subject: `Query ${i + 1}: ${message.substring(0, 50)}`,
            body: message,
            priority,
          });
          results.email++;
          break;

        case 'social':
          await sendSocialWebhook({
            message,
            subject: `Social Query ${i + 1}`,
            priority,
          });
          results.social++;
          break;

        case 'chat':
          await sendChatMessage({
            message,
            subject: `Chat Query ${i + 1}`,
            priority,
          });
          results.chat++;
          break;

        case 'community':
          await sendCommunityWebhook({
            message,
            subject: `Community Query ${i + 1}`,
            priority,
          });
          results.community++;
          break;
      }

      results.total++;
      process.stdout.write(`\rProgress: ${i + 1}/${count} (${((i + 1) / count * 100).toFixed(1)}%)`);

      if (delayMs > 0 && i < count - 1) {
        await delay(delayMs);
      }
    } catch (error) {
      results.errors++;
      console.error(`\n❌ Error generating message ${i + 1}:`, error.message);
    }
  }

  console.log('\n\n✅ Bulk generation complete!');
  console.log('\n📊 Summary:');
  console.log(`   Email: ${results.email}`);
  console.log(`   Social: ${results.social}`);
  console.log(`   Chat: ${results.chat}`);
  console.log(`   Community: ${results.community}`);
  console.log(`   Total: ${results.total}`);
  console.log(`   Errors: ${results.errors}`);

  return results;
}


export default generateBulkMessages;
