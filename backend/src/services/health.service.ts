import Database from 'better-sqlite3';
import { HealthCheckResult } from '../types';

export class HealthService {
  constructor(private readonly db: Database.Database) {}

  checkHealth(): HealthCheckResult {
    let databaseStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      const ping = this.db.prepare('SELECT 1 as alive').get() as { alive: number } | undefined;
      if (ping?.alive === 1) {
        databaseStatus = 'connected';
      }
    } catch {
      databaseStatus = 'disconnected';
    }

    return {
      status: databaseStatus === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: databaseStatus,
    };
  }
}
