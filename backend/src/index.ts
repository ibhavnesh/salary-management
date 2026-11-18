import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { initDb, closeDb } from './db';

const PORT = parseInt(process.env.PORT || '3001', 10);

const db = initDb();
const app = createApp(db);

const server = app.listen(PORT, () => {
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
