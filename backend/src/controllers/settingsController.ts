import { Request, Response } from 'express';
import { settingsService } from '../services/settingsService';
import { asyncHandler } from '../utils/asyncHandler';
import { success, failure } from '../utils/apiResponse';

export const settingsController = {
  getSettings: asyncHandler(async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const settings = await settingsService.getSettings(category);
    res.json(success(settings));
  }),

  updateSettings: asyncHandler(async (req: Request, res: Response) => {
    const { category, data } = req.body as { category: string; data: any };
    const updatedBy = req.headers['x-user-id'] as string | undefined;

    if (!category || !data) {
      return res.status(400).json(failure('Category and data are required'));
    }

    await settingsService.updateSettings(category as any, data, updatedBy);
    res.json(success(null, 'Settings updated successfully'));
  }),

  resetSettings: asyncHandler(async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    await settingsService.resetSettings(category as any);
    res.json(success(null, 'Settings reset successfully'));
  }),
};

