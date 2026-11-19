import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { getDb } from './db';
import { createRoutes } from './routes';
import { HttpError } from './types';

export function createApp(dbInstance?: Database.Database): Express {
  const app = express();
  const db = dbInstance || getDb();

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin static file serving)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        'https://salary-management-production-c446091b.up.railway.app',
        'http://localhost:5173',
        'http://localhost:3001',
      ];
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
  app.use(express.json());

  // Mount application routes (/health, /api/employees, /api/insights)
  app.use('/', createRoutes(db));

  // In production, serve built frontend static files and provide SPA fallback
  if (process.env.NODE_ENV === 'production') {
    const frontendDist = process.env.FRONTEND_DIST || path.resolve(__dirname, '../../frontend/dist');
    if (fs.existsSync(frontendDist)) {
      app.use(express.static(frontendDist));
      app.get('*', (req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
          if (err) {
            next(err);
          }
        });
      });
    }
  }

  // Unknown /api/* routes must return JSON 404
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // General 404 handler for unmatched routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Central error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof HttpError) {
      const errorPayload: { message: string; details?: unknown } = {
        message: err.message,
      };
      if (err.details !== undefined) {
        errorPayload.details = err.details;
      }
      res.status(err.statusCode).json({ error: errorPayload });
      return;
    }

    console.error('Unhandled error:', err);
    res.status(500).json({ error: { message: 'Internal Server Error' } });
  });

  return app;
}
