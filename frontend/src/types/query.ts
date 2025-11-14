export type QueryStatus = 'new' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
export type QueryPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface QueryTag {
  name: string;
  confidence: number;
}

export interface QueryAIInsights {
  category: string;
  sentiment: string;
  urgency: string;
  confidence: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface Query {
  id: string;
  channel: string;
  subject: string;
  message: string;
  customerName?: string | null;
  customerEmail?: string | null;
  tags: QueryTag[] | unknown;
  priority: string;
  status: string;
  assignmentId?: string | null;
  teamId?: string | null;
  assignee?: User | null;
  team?: Team | null;
  aiInsights?: QueryAIInsights | null;
  createdAt: string;
  updatedAt: string;
}

