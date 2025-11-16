import { logger } from '../utils/logger';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface PriorityResult {
  priority: Priority;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reasons: string[];
}

const URGENCY_KEYWORDS: Record<string, Priority> = {
  critical: 'urgent',
  immediately: 'urgent',
  asap: 'urgent',
  emergency: 'urgent',
  urgent: 'high',
  important: 'high',
  priority: 'high',
  soon: 'high',
  quickly: 'high',
  fast: 'medium',
  whenever: 'low',
  eventually: 'low',
  no_rush: 'low',
};

const SENTIMENT_PRIORITY_MAP: Record<string, Priority> = {
  negative: 'high',
  very_negative: 'urgent',
  angry: 'urgent',
  frustrated: 'high',
  neutral: 'medium',
  positive: 'low',
};

const CATEGORY_PRIORITY_MAP: Record<string, Priority> = {
  complaint: 'high',
  bug: 'high',
  error: 'high',
  security: 'urgent',
  billing: 'high',
  payment: 'high',
  question: 'medium',
  feedback: 'low',
  request: 'medium',
};

function detectUrgencyFromMessage(message: string): { urgency: string; reasons: string[] } {
  const lower = message.toLowerCase();
  const reasons: string[] = [];
  let maxUrgency = 'low';

  for (const [keyword, priority] of Object.entries(URGENCY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      reasons.push(`Keyword: "${keyword}"`);
      if (priority === 'urgent' && maxUrgency !== 'critical') {
        maxUrgency = 'critical';
      } else if (priority === 'high' && !['critical', 'high'].includes(maxUrgency)) {
        maxUrgency = 'high';
      } else if (priority === 'medium' && maxUrgency === 'low') {
        maxUrgency = 'medium';
      }
    }
  }

  if (reasons.length === 0) {
    reasons.push('No urgency keywords detected');
  }

  return { urgency: maxUrgency, reasons };
}

function detectPriorityFromAIInsights(aiInsights: unknown): { priority: Priority; reasons: string[] } {
  if (!aiInsights || typeof aiInsights !== 'object' || aiInsights === null) {
    return { priority: 'medium', reasons: ['No AI insights available'] };
  }

  const insights = aiInsights as Record<string, unknown>;
  const reasons: string[] = [];
  const priorities: Priority[] = [];

  const sentiment = insights.sentiment as string | undefined;
  if (sentiment) {
    const normalized = sentiment.toLowerCase().replace(/\s+/g, '_');
    const priority = SENTIMENT_PRIORITY_MAP[normalized];
    if (priority) {
      priorities.push(priority);
      reasons.push(`Sentiment: ${sentiment} → ${priority}`);
    }
  }

  const category = insights.category as string | undefined;
  if (category) {
    const normalized = category.toLowerCase();
    const priority = CATEGORY_PRIORITY_MAP[normalized];
    if (priority) {
      priorities.push(priority);
      reasons.push(`Category: ${category} → ${priority}`);
    }
  }

  const aiUrgency = insights.urgency as string | undefined;
  if (aiUrgency) {
    const normalized = aiUrgency.toLowerCase();
    if (normalized === 'critical') {
      priorities.push('urgent');
      reasons.push(`AI urgency: ${aiUrgency} → urgent`);
    } else if (normalized === 'high') {
      priorities.push('high');
      reasons.push(`AI urgency: ${aiUrgency} → high`);
    }
  }

  if (priorities.length === 0) {
    return { priority: 'medium', reasons: ['No priority indicators in AI insights'] };
  }

  const maxPriority = priorities.includes('urgent')
    ? 'urgent'
    : priorities.includes('high')
      ? 'high'
      : priorities.includes('medium')
        ? 'medium'
        : 'low';

  return { priority: maxPriority, reasons };
}

function detectPriorityFromTags(tags: unknown): { priority: Priority; reasons: string[] } {
  if (!tags || !Array.isArray(tags)) {
    return { priority: 'medium', reasons: ['No tags available'] };
  }

  const reasons: string[] = [];
  const priorities: Priority[] = [];

  for (const tag of tags) {
    if (typeof tag === 'object' && tag !== null && 'name' in tag) {
      const tagName = String(tag.name).toLowerCase();

      if (tagName.includes('urgent') || tagName.includes('critical')) {
        priorities.push('urgent');
        reasons.push(`Tag: ${tagName} → urgent`);
      } else if (tagName.includes('high') || tagName.includes('important')) {
        priorities.push('high');
        reasons.push(`Tag: ${tagName} → high`);
      } else if (tagName.includes('complaint') || tagName.includes('bug')) {
        priorities.push('high');
        reasons.push(`Tag: ${tagName} → high`);
      } else if (tagName.includes('low') || tagName.includes('feedback')) {
        priorities.push('low');
        reasons.push(`Tag: ${tagName} → low`);
      }
    }
  }

  if (priorities.length === 0) {
    return { priority: 'medium', reasons: ['No priority indicators in tags'] };
  }

  const maxPriority = priorities.includes('urgent')
    ? 'urgent'
    : priorities.includes('high')
      ? 'high'
      : priorities.includes('medium')
        ? 'medium'
        : 'low';

  return { priority: maxPriority, reasons };
}

export const priorityDetectionService = {
  detectPriority(
    message: string,
    tags?: unknown,
    aiInsights?: unknown
  ): PriorityResult {
    logger.debug({ messageLength: message.length }, 'Detecting priority');

    const urgencyResult = detectUrgencyFromMessage(message);
    const tagResult = detectPriorityFromTags(tags);
    const aiResult = detectPriorityFromAIInsights(aiInsights);

    const allReasons = [...urgencyResult.reasons, ...tagResult.reasons, ...aiResult.reasons];
    const allPriorities: Priority[] = [tagResult.priority, aiResult.priority];

    if (urgencyResult.urgency === 'critical') {
      allPriorities.push('urgent');
    } else if (urgencyResult.urgency === 'high') {
      allPriorities.push('high');
    }

    let finalPriority: Priority = 'medium';
    if (allPriorities.includes('urgent')) {
      finalPriority = 'urgent';
    } else if (allPriorities.includes('high')) {
      finalPriority = 'high';
    } else if (allPriorities.includes('low') && !allPriorities.includes('high')) {
      finalPriority = 'low';
    }

    const urgencyMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      urgent: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };

    const finalUrgency = urgencyMap[finalPriority] || 'medium';

    const confidence = allReasons.length > 1 ? 0.8 : allReasons.length === 1 ? 0.6 : 0.4;

    logger.info(
      { priority: finalPriority, urgency: finalUrgency, reasons: allReasons },
      'Priority detected'
    );

    return {
      priority: finalPriority,
      urgency: finalUrgency,
      confidence,
      reasons: allReasons,
    };
  },
};

