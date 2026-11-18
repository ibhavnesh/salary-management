import { Router } from 'express';
import Database from 'better-sqlite3';
import { createHealthRouter } from './health.route';
import { createEmployeeRouter } from './employee.route';

export function createRoutes(db: Database.Database): Router {
  const router = Router();

  router.use(createHealthRouter(db));
  router.use('/api/employees', createEmployeeRouter(db));

  return router;
}

export * from './health.route';
export * from './employee.route';
