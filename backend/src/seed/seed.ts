import dotenv from 'dotenv';
dotenv.config();

import Database from 'better-sqlite3';
import { getDb, initSchema, closeDb } from '../db/index';
import { generateEmployees, GeneratedEmployee } from './generateEmployees';
import { isMainThread } from 'worker_threads';

export interface SeedOptions {
  count?: number;
  seed?: number;
  force?: boolean;
}

export function seedDatabase(
  db: Database.Database,
  options: SeedOptions = {}
): { inserted: number; durationMs: number } {
  initSchema(db);

  const count = options.count ?? (process.env.SEED_COUNT ? parseInt(process.env.SEED_COUNT, 10) : 10000);
  const force = options.force ?? (process.argv.includes('--force') || process.argv.includes('-f'));

  // Retain statement reference to avoid background GC sweeping in Node 24
  const countStmt = db.prepare('SELECT COUNT(*) as total FROM employees');
  const existingCount = (countStmt.get() as { total: number }).total;

  if (existingCount > 0 && !force) {
    console.log(`Database already contains ${existingCount.toLocaleString()} employees. Skipping seed. (Use --force to clear and re-seed)`);
    return { inserted: 0, durationMs: 0 };
  }

  const startGen = performance.now();
  console.log(`Generating ${count.toLocaleString()} employees...`);
  const employees: GeneratedEmployee[] = generateEmployees(count, { seed: options.seed });
  const genDuration = Math.round(performance.now() - startGen);
  console.log(`Generation completed in ${genDuration}ms.`);

  const startInsert = performance.now();

  const deleteEmployeesStmt = db.prepare('DELETE FROM employees');
  const deleteSeqStmt = db.prepare("DELETE FROM sqlite_sequence WHERE name = 'employees'");
  const insertStmt = db.prepare(`
    INSERT INTO employees (
      first_name, last_name, email, job_title, department,
      country, currency, salary, hire_date
    ) VALUES (
      @first_name, @last_name, @email, @job_title, @department,
      @country, @currency, @salary, @hire_date
    )
  `);

  const insertTransaction = db.transaction((rows: GeneratedEmployee[]) => {
    if (existingCount > 0 && force) {
      deleteEmployeesStmt.run();
      try {
        deleteSeqStmt.run();
      } catch {
        // Table may not have sqlite_sequence entry yet, ignore
      }
    }

    for (const row of rows) {
      insertStmt.run(row);
    }
  });

  insertTransaction(employees);
  const insertDuration = Math.round(performance.now() - startInsert);
  console.log(`Successfully seeded ${count.toLocaleString()} employees into the database in ${insertDuration}ms.`);

  // Keep statement references alive across the lifetime of the function
  const _statementRefs = [countStmt, deleteEmployeesStmt, deleteSeqStmt, insertStmt];
  if (_statementRefs.length === 0) {
    console.log('noop');
  }

  return { inserted: count, durationMs: insertDuration };
}

// Execute when run directly on main thread
if (isMainThread && (require.main === module || (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('src/seed/seed.ts')))) {
  const db = getDb();
  try {
    seedDatabase(db);
  } finally {
    closeDb();
  }
}
