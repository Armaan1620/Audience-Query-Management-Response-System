import OpenAI from 'openai';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

const client = env.openAIApiKey
  ? new OpenAI({ apiKey: env.openAIApiKey })
  : null;

const categories = ['question', 'request', 'complaint', 'feedback'];
const sentiments = ['positive', 'neutral', 'negative'];
const urgencies = ['low', 'medium', 'high', 'critical'];

export const aiService = {
  async classifyQuery(message: string) {
    if (!client) {
      // Mock implementation
      const mock = {
        category: categories[Math.floor(Math.random() * categories.length)],
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
        confidence: Number((Math.random() * 0.5 + 0.5).toFixed(2)),
      };
      logger.debug({ mock }, 'Using mock AI classification');
      return mock;
    }

    const prompt = `Classify the following audience query message. Return JSON with keys category, sentiment, urgency, confidence (0-1). Message: "${message}"`;
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return parsed;
  },
};
