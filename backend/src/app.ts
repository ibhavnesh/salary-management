import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { getDb } from './db';
import { createRoutes } from './routes';

export function createApp(dbInstance?: Database.Database): Express {
  const app = express();
  const db = dbInstance || getDb();

  app.use(cors());
  app.use(express.json());

  // Mount application routes
  app.use('/', createRoutes(db));

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Central error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}
