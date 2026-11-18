import { Request, Response } from 'express';
import { HealthService } from '../services';

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  getHealth = (_req: Request, res: Response): void => {
    const health = this.healthService.checkHealth();
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  };
}
