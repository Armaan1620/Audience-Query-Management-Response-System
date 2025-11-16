import { Request, Response } from 'express';
import { teamsService } from '../services/teamsService';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/apiResponse';

export const teamsController = {
  getTeamsWithQueries: asyncHandler(async (_req: Request, res: Response) => {
    const data = await teamsService.getTeamsWithQueries();
    res.json(success(data));
  }),
};

