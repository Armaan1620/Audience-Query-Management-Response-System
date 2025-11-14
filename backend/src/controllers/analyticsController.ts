import { Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/apiResponse';

export const analyticsController = {
  summary: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getSummary();
    res.json(success(data));
  }),
};