import { Router } from 'express';
import Database from 'better-sqlite3';
import { InsightsRepository } from '../repositories';
import { InsightsService } from '../services';
import { InsightsController } from '../controllers';

export function createInsightsRouter(db: Database.Database): Router {
  const router = Router();
  const repository = new InsightsRepository(db);
  const service = new InsightsService(repository);
  const controller = new InsightsController(service);

  router.get('/summary', controller.getSummary);
  router.get('/salary-stats', controller.getSalaryStats);
  router.get('/extremes', controller.getExtremes);
  router.get('/distribution', controller.getDistribution);

  return router;
}
