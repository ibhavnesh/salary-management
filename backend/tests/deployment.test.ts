import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { createApp } from '../src/app';
import { initDb } from '../src/db';
import { seedDatabase } from '../src/seed/seed';
import { Express } from 'express';

describe('Deployment & Production Middleware', () => {
  let db: Database.Database;
  let app: Express;

  beforeEach(() => {
    db = initDb({ inMemory: true });
    app = createApp(db);
  });

  afterEach(() => {
    if (db && db.open) {
      db.close();
    }
  });

  it('returns JSON 404 for unknown /api/* routes', async () => {
    const response = await request(app).get('/api/nonexistent-endpoint');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Not Found' });
  });

  it('serves index.html for non-api routes in production when frontend dist exists', async () => {
    const tempDist = path.join(process.cwd(), 'temp-dist');
    if (!fs.existsSync(tempDist)) {
      fs.mkdirSync(tempDist, { recursive: true });
    }
    fs.writeFileSync(path.join(tempDist, 'index.html'), '<html><body>Test App</body></html>');

    const origEnv = process.env.NODE_ENV;
    const origDist = process.env.FRONTEND_DIST;

    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_DIST = tempDist;

    const prodApp = createApp(db);

    const res = await request(prodApp).get('/some-random-route');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Test App');

    // Cleanup
    process.env.NODE_ENV = origEnv;
    process.env.FRONTEND_DIST = origDist;
    fs.rmSync(tempDist, { recursive: true, force: true });
  });

  it('auto-seeds when database is empty and skips when non-empty', () => {
    const countStmt = db.prepare('SELECT COUNT(*) as total FROM employees');
    let total = (countStmt.get() as { total: number }).total;
    expect(total).toBe(0);

    // Simulate auto-seed logic
    const seeded = seedDatabase(db, { count: 10, quiet: true });
    expect(seeded.inserted).toBe(10);

    total = (countStmt.get() as { total: number }).total;
    expect(total).toBe(10);

    // Re-run without force: should skip
    const skipped = seedDatabase(db, { count: 10, quiet: true, force: false });
    expect(skipped.inserted).toBe(0);
  });
});
