import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { InsightsService } from '../services';
import {
  salaryStatsQuerySchema,
  extremesQuerySchema,
  distributionQuerySchema,
  ValidationError,
} from '../types';

function formatZodErrors(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  getSummary = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      res.json(this.insightsService.getSummary());
    } catch (err) {
      next(err);
    }
  };

  getSalaryStats = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = salaryStatsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query parameters', formatZodErrors(parsed.error));
      }
      res.json(this.insightsService.getSalaryStats(parsed.data));
    } catch (err) {
      next(err);
    }
  };

  getExtremes = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = extremesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query parameters', formatZodErrors(parsed.error));
      }
      res.json(this.insightsService.getExtremes(parsed.data));
    } catch (err) {
      next(err);
    }
  };

  getDistribution = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = distributionQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query parameters', formatZodErrors(parsed.error));
      }
      res.json(this.insightsService.getDistribution(parsed.data));
    } catch (err) {
      next(err);
    }
  };
}
