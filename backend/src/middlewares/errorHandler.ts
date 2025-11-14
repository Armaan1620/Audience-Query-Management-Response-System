import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { failure } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  logger.error({ err }, 'Unhandled error');

  if (err instanceof ZodError) {
    return res.status(400).json(
      failure('Validation error', {
        errors: err.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      })
    );
  }

  if (err instanceof Error) {
    const status = (err as any).status || 500;
    return res.status(status).json(failure(err.message));
  }

  res.status(500).json(failure('Unexpected error'));
}
