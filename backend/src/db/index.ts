import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initSchema } from './schema';

let activeDb: Database.Database | null = null;

export interface DbOptions {
  path?: string;
  inMemory?: boolean;
}

export function createDb(options: DbOptions = {}): Database.Database {
  let dbLocation: string;

  if (options.inMemory || options.path === ':memory:') {
    dbLocation = ':memory:';
  } else {
    dbLocation = options.path || process.env.DATABASE_PATH || path.resolve(process.cwd(), 'salary.db');
    const dir = path.dirname(dbLocation);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbLocation);

  db.exec('PRAGMA foreign_keys = ON;');
  if (dbLocation !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }

  return db;
}

export function initDb(options: DbOptions = {}): Database.Database {
  const db = createDb(options);
  initSchema(db);
  return db;
}

export function getDb(): Database.Database {
  if (!activeDb) {
    activeDb = initDb();
  }
  return activeDb;
}

export function setDb(db: Database.Database): void {
  activeDb = db;
}

export function closeDb(): void {
  if (activeDb && activeDb.open) {
    activeDb.close();
    activeDb = null;
  }
}

export { initSchema } from './schema';
