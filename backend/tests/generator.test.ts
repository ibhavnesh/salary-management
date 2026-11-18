import { describe, it, expect } from 'vitest';
import {
  generateEmployees,
  COUNTRIES,
  DEPARTMENTS,
} from '../src/seed/generateEmployees';
import { seedDatabase } from '../src/seed/seed';
import { initDb } from '../src/db';
import Database from 'better-sqlite3';

describe('generateEmployees', () => {
  it('returns exactly N employees', () => {
    const count = 250;
    const employees = generateEmployees(count, { seed: 101 });
    expect(employees).toHaveLength(count);
  });

  it('guarantees unique email addresses across all generated employees', () => {
    const count = 1000;
    const employees = generateEmployees(count, { seed: 102 });
    const emailSet = new Set(employees.map((e) => e.email));
    expect(emailSet.size).toBe(count);
  });

  it('generates positive integer salaries in whole currency units', () => {
    const employees = generateEmployees(500, { seed: 103 });
    for (const emp of employees) {
      expect(emp.salary).toBeGreaterThan(0);
      expect(Number.isInteger(emp.salary)).toBe(true);
    }
  });

  it('maintains consistent country and currency code mappings', () => {
    const countryCurrencyMap = new Map(COUNTRIES.map((c) => [c.country, c.currency]));
    const employees = generateEmployees(500, { seed: 104 });

    for (const emp of employees) {
      expect(countryCurrencyMap.has(emp.country)).toBe(true);
      expect(emp.currency).toBe(countryCurrencyMap.get(emp.country));
      expect(emp.currency).toHaveLength(3);
    }
  });

  it('produces identical deterministic output when using the same seed', () => {
    const employeesA = generateEmployees(100, { seed: 777 });
    const employeesB = generateEmployees(100, { seed: 777 });

    expect(employeesA).toEqual(employeesB);
  });

  it('produces different output when using different seeds', () => {
    const employeesA = generateEmployees(100, { seed: 111 });
    const employeesB = generateEmployees(100, { seed: 222 });

    expect(employeesA).not.toEqual(employeesB);
  });

  it('assigns valid departments and matching job titles', () => {
    const validDepts = new Map(
      DEPARTMENTS.map((d) => [d.name, new Set(d.jobTitles.map((j) => j.title))])
    );
    const employees = generateEmployees(300, { seed: 105 });

    for (const emp of employees) {
      expect(validDepts.has(emp.department)).toBe(true);
      const titleSet = validDepts.get(emp.department)!;
      expect(titleSet.has(emp.job_title)).toBe(true);
    }
  });

  it('generates valid hire dates within the last 10 years', () => {
    const refDate = new Date('2026-11-18T00:00:00.000Z');
    const employees = generateEmployees(200, { seed: 106, referenceDate: refDate });

    const tenYearsAgoMs = new Date('2016-11-18T00:00:00.000Z').getTime();
    const refDateMs = refDate.getTime();

    for (const emp of employees) {
      expect(emp.hire_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const timestamp = new Date(emp.hire_date).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(tenYearsAgoMs);
      expect(timestamp).toBeLessThanOrEqual(refDateMs);
    }
  });
});

describe('seedDatabase', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = initDb({ inMemory: true });
  });

  afterEach(() => {
    if (db && db.open) {
      db.close();
    }
  });

  it('seeds data into the database using transactions and handles idempotency', () => {
    // Initial seed
    const result1 = seedDatabase(db, { count: 50, seed: 42 });
    expect(result1.inserted).toBe(50);

    const countRow1 = db.prepare('SELECT COUNT(*) as total FROM employees').get() as { total: number };
    expect(countRow1.total).toBe(50);

    // Re-run without force: should skip
    const result2 = seedDatabase(db, { count: 50, seed: 42, force: false });
    expect(result2.inserted).toBe(0);

    const countRow2 = db.prepare('SELECT COUNT(*) as total FROM employees').get() as { total: number };
    expect(countRow2.total).toBe(50);

    // Re-run with force: should re-seed
    const result3 = seedDatabase(db, { count: 75, seed: 43, force: true });
    expect(result3.inserted).toBe(75);

    const countRow3 = db.prepare('SELECT COUNT(*) as total FROM employees').get() as { total: number };
    expect(countRow3.total).toBe(75);
  });
});
