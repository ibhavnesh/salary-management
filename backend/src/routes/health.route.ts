import { Router } from 'express';
import { HealthController } from '../controllers';
import { HealthService } from '../services';
import Database from 'better-sqlite3';

export function createHealthRouter(db: Database.Database): Router {
  const router = Router();
  const healthService = new HealthService(db);
  const healthController = new HealthController(healthService);

  router.get('/health', healthController.getHealth);

  return router;
}
