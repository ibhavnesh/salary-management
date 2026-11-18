import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app';
import { initDb } from '../src/db';

describe('GET /health', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = initDb({ inMemory: true });
  });

  afterEach(() => {
    if (db && db.open) {
      db.close();
    }
  });

  it('returns 200 with health status and database connected', async () => {
    const app = createApp(db);
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      database: 'connected',
    });
    expect(typeof response.body.timestamp).toBe('string');
    expect(typeof response.body.uptime).toBe('number');
  });

  it('returns 404 for unknown endpoints', async () => {
    const app = createApp(db);
    const response = await request(app).get('/unknown-path');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Not Found' });
  });
});
