# Query Simulator

A comprehensive simulator for generating test queries across multiple channels (email, social, chat, community) to test the Audience Query Management System.

## Overview

This simulator module provides tools to generate realistic test data for the query management system. It supports individual message generation and bulk operations for load testing.

## Installation

```bash
cd simulator
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Environment Variables

- `INGESTION_BASE_URL`: Base URL for the API (default: `http://localhost:4000/api`)
- `HTTP_CLIENT_TIMEOUT_MS`: HTTP timeout in milliseconds (default: `10000`)
- `SMTP_HOST`: SMTP server hostname (default: `smtp.gmail.com`)
- `SMTP_PORT`: SMTP server port (default: `587`)
- `SMTP_USER`: SMTP username/email
- `SMTP_PASS`: SMTP password/app password
- `EMAIL_FROM`: Default sender email address
- `EMAIL_TO`: Default recipient email address (ingestion endpoint)

## Usage

### Email Simulator

Sends an email using Nodemailer and creates a query in the system.

```bash
npm run email
```

Or programmatically:

```javascript
import sendEmail from './email/sendEmail.js';

await sendEmail({
  from: 'customer@example.com',
  to: 'support@example.com',
  subject: 'Help with my account',
  body: 'I need assistance with my account settings.',
  customerName: 'John Doe',
  customerEmail: 'customer@example.com',
  priority: 'medium',
});
```

### Social Webhook Simulator

Sends a mock social media webhook (Instagram, Twitter, Facebook).

```bash
npm run social
```

Or programmatically:

```javascript
import sendSocialWebhook from './social/sendSocialWebhook.js';

await sendSocialWebhook({
  platform: 'twitter',
  user: '@username',
  message: 'I have a question about your service.',
  priority: 'high',
});
```

### Chat Message Simulator

Sends a chat message to the chat ingestion endpoint.

```bash
npm run chat
```

Or programmatically:

```javascript
import sendChatMessage from './chat/sendChatMessage.js';

await sendChatMessage({
  platform: 'live_chat',
  userId: 'user-123',
  message: 'Hello, I need help.',
  priority: 'medium',
});
```

### Community Webhook Simulator

Sends a community-style webhook (forum, Reddit, Discord, etc.).

```bash
npm run community
```

Or programmatically:

```javascript
import sendCommunityWebhook from './community/sendCommunityWebhook.js';

await sendCommunityWebhook({
  type: 'reddit',
  username: 'redditor123',
  message: 'I have a question about the product.',
  priority: 'low',
});
```

### Bulk Generator

Generates 100-500 dummy messages across all channels.

```bash
# Generate 100 messages (default)
npm run bulk

# Generate 100 messages explicitly
npm run bulk:100

# Generate 500 messages
npm run bulk:500
```

Or programmatically:

```javascript
import generateBulkMessages from './bulk/bulkGenerator.js';

await generateBulkMessages({
  count: 200,
  delayMs: 50, // Delay between messages in milliseconds
});
```

## Sample Messages

The bulk generator includes 50 pre-configured sample messages covering:
- Account management
- Billing and payments
- Technical support
- Product questions
- Feature requests
- Bug reports
- General inquiries

## Architecture

### httpClient.js

Shared Axios instance with:
- Configurable base URL from environment
- Timeout configuration
- JSON headers
- Centralized error logging

### Channel Simulators

Each channel simulator:
1. Generates realistic payload data
2. Sends to the appropriate endpoint
3. Creates a query in the system via `/api/queries`
4. Returns the created query ID

### Bulk Generator

The bulk generator:
- Randomly selects channels and messages
- Distributes load across all channels
- Includes progress tracking
- Provides summary statistics
- Handles errors gracefully

## Examples

### Generate 100 Test Messages

```bash
npm run bulk:100
```

### Send a Single Email

```bash
node -e "import('./email/sendEmail.js').then(m => m.default({ subject: 'Test', body: 'Test message' }))"
```

### Send Multiple Social Messages

```bash
for i in {1..10}; do npm run social; sleep 1; done
```

## Error Handling

All simulators include error handling and logging:
- HTTP errors are logged with full details
- Failed messages are tracked in bulk operations
- Individual failures don't stop bulk generation

## Notes

- The simulator uses the `/api/queries` endpoint to create queries
- Email simulator requires SMTP configuration for actual email sending
- All simulators can work without SMTP (queries are still created)
- Bulk generator includes a delay between messages to avoid overwhelming the API
- Sample messages are randomly selected for variety

