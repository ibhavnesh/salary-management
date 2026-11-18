import { Router } from 'express';
import Database from 'better-sqlite3';
import { createHealthRouter } from './health.route';

export function createRoutes(db: Database.Database): Router {
  const router = Router();

  router.use(createHealthRouter(db));

  return router;
}

export * from './health.route';
