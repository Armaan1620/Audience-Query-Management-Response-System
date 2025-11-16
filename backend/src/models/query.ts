export type QueryStatus = 'new' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
export type QueryChannel = 'email' | 'social' | 'chat' | 'community';

export interface QueryTag {
  name: string;
  confidence: number;
}

export interface QueryAssignment {
  userId?: string;
  teamId?: string;
  assignedAt?: Date;
}

export interface QueryAIInsights {
  category: string;
  sentiment: string;
  urgency: string;
  confidence: number;
}

export interface Query {
  id: string;
  externalId?: string;
  channel: QueryChannel;
  subject: string;
  message: string;
  customerName?: string;
  customerEmail?: string;
  tags: QueryTag[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: QueryStatus;
  assignment?: QueryAssignment;
  aiInsights?: QueryAIInsights;
  createdAt: Date;
  updatedAt: Date;
}
