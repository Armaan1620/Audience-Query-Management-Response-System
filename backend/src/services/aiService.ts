import OpenAI from 'openai';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

const client = env.openAIApiKey
  ? new OpenAI({ apiKey: env.openAIApiKey })
  : null;

const categories = ['question', 'request', 'complaint', 'feedback'] as const;
const sentiments = ['positive', 'neutral', 'negative'] as const;
const urgencies = ['low', 'medium', 'high', 'critical'] as const;

export interface AIClassificationResult {
  category: string;
  sentiment: string;
  urgency: string;
  confidence: number;
}

export const aiService = {
  async classifyQuery(message: string): Promise<AIClassificationResult> {
    if (!client) {
      // Mock implementation
      const category = categories[Math.floor(Math.random() * categories.length)] ?? 'question';
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)] ?? 'neutral';
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)] ?? 'medium';

      const mock: AIClassificationResult = {
        category,
        sentiment,
        urgency,
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

    const parsed = JSON.parse(content) as AIClassificationResult;
    return parsed;
  },
};
