import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { initDb, closeDb } from './db';
import { seedDatabase } from './seed/seed';

const PORT = parseInt(process.env.PORT || '3001', 10);

const db = initDb();

// Auto-seed if empty and SEED_ON_EMPTY is not explicitly false
const countStmt = db.prepare('SELECT COUNT(*) as total FROM employees');
const { total } = countStmt.get() as { total: number };
if (total === 0 && process.env.SEED_ON_EMPTY !== 'false') {
  console.log('Database is empty. Automatically seeding 10,000 employees...');
  seedDatabase(db, { quiet: true });
}

const app = createApp(db);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server listening on port ${PORT}`);
});

function handleShutdown(signal: string): void {
  console.log(`Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    closeDb();
    console.log('Server and database connections closed.');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
