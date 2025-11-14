import { Request, Response } from 'express';
import { queryService } from '../services/queryService';
import { success } from '../utils/apiResponse';
import { createQuerySchema } from '../validators/queryValidator';
import { asyncHandler } from '../utils/asyncHandler';

export const queryController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const queries = await queryService.listQueries();
    res.json(success(queries));
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const query = await queryService.getQuery(id);
    res.json(success(query));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createQuerySchema.parse(req.body);

    const created = await queryService.createQuery({
      channel: parsed.channel,
      subject: parsed.subject,
      message: parsed.message,
      ...(parsed.customerName !== undefined && { customerName: parsed.customerName }),
      ...(parsed.customerEmail !== undefined && { customerEmail: parsed.customerEmail }),
      tags: parsed.tags,
      priority: parsed.priority,
      status: 'new',
    });

    res.status(201).json(success(created, 'Query created'));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status, reason, actorId } = req.body as { status: string; reason?: string; actorId?: string };
    const updated = await queryService.updateStatus(id, status as any, actorId, reason);
    res.json(success(updated, 'Status updated'));
  }),

  assign: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { assignmentId, teamId, actorId } = req.body as {
      assignmentId?: string;
      teamId?: string;
      actorId?: string;
    };
    const updated = await queryService.assignQuery(id, assignmentId, teamId, actorId);
    res.json(success(updated, 'Assignment updated'));
  }),

  activities: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const items = await queryService.listActivities(id);
    res.json(success(items));
  }),
};
