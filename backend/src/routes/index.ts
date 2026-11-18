import { Router } from 'express';
import Database from 'better-sqlite3';
import { createHealthRouter } from './health.route';
import { createEmployeeRouter } from './employee.route';
import { createInsightsRouter } from './insights.route';

export function createRoutes(db: Database.Database): Router {
  const router = Router();

  router.use(createHealthRouter(db));
  router.use('/api/employees', createEmployeeRouter(db));
  router.use('/api/insights', createInsightsRouter(db));

  return router;
}

export * from './health.route';
export * from './employee.route';
export * from './insights.route';
