export interface QueryActivity {
  id: string;
  queryId: string;
  actorId?: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
