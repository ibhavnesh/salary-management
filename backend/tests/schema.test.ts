import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { initDb, initSchema } from '../src/db';

describe('Database Schema & Init', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = initDb({ inMemory: true });
  });

  afterEach(() => {
    if (db && db.open) {
      db.close();
    }
  });

  it('creates the employees table and expected columns', () => {
    const tableInfo = db.prepare("PRAGMA table_info('employees')").all() as Array<{
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }>;

    const columnNames = tableInfo.map((col) => col.name);
    expect(columnNames).toEqual([
      'id',
      'first_name',
      'last_name',
      'email',
      'job_title',
      'department',
      'country',
      'currency',
      'salary',
      'hire_date',
      'created_at',
      'updated_at',
    ]);

    // Verify primary key
    const idCol = tableInfo.find((col) => col.name === 'id');
    expect(idCol?.pk).toBe(1);
  });

  it('creates indexes on country, department, job_title, and salary', () => {
    const indexList = db.prepare("PRAGMA index_list('employees')").all() as Array<{
      name: string;
      unique: number;
    }>;

    const indexNames = indexList.map((idx) => idx.name);
    expect(indexNames).toContain('idx_employees_country');
    expect(indexNames).toContain('idx_employees_department');
    expect(indexNames).toContain('idx_employees_job_title');
    expect(indexNames).toContain('idx_employees_salary');
  });

  it('is idempotent when initSchema is called multiple times', () => {
    expect(() => {
      initSchema(db);
      initSchema(db);
    }).not.toThrow();
  });

  it('allows inserting and querying an employee record', () => {
    const stmt = db.prepare(`
      INSERT INTO employees (
        first_name, last_name, email, job_title, department,
        country, currency, salary, hire_date
      ) VALUES (
        'Jane', 'Doe', 'jane.doe@acme.corp', 'Software Engineer', 'Engineering',
        'USA', 'USD', 120000, '2023-01-15'
      )
    `);

    const result = stmt.run();
    expect(result.changes).toBe(1);

    const row = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid) as {
      first_name: string;
      email: string;
      salary: number;
    };

    expect(row.first_name).toBe('Jane');
    expect(row.email).toBe('jane.doe@acme.corp');
    expect(row.salary).toBe(120000);
  });
});
