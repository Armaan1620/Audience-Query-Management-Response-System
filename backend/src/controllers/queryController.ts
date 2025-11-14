import { Request, Response } from 'express';
import { queryService } from '../services/queryService';
import { success } from '../utils/apiResponse';
import { createQuerySchema } from '../validators/queryValidator';
import { asyncHandler } from '../utils/asyncHandler';

export const queryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const queries = await queryService.listQueries();
    res.json(success(queries));
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const query = await queryService.getQuery(req.params.id);
    res.json(success(query));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createQuerySchema.parse(req.body);
    const created = await queryService.createQuery({
      channel: parsed.channel,
      subject: parsed.subject,
      message: parsed.message,
      customerName: parsed.customerName,
      customerEmail: parsed.customerEmail,
      tags: parsed.tags,
      priority: parsed.priority,
      status: 'new',
    });
    res.status(201).json(success(created, 'Query created'));
  }),
};
