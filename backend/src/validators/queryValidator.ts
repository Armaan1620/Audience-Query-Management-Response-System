import { z } from 'zod';

export const createQuerySchema = z.object({
  channel: z.enum(['email', 'social', 'chat', 'community']),
  subject: z.string().min(1),
  message: z.string().min(1),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  tags: z
    .array(
      z.object({
        name: z.string(),
        confidence: z.number().min(0).max(1),
      })
    )
    .default([]),
});

export type CreateQueryInput = z.infer<typeof createQuerySchema>;
