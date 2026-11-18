import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { Express } from 'express';
import { createApp } from '../src/app';
import { initDb } from '../src/db';
import {
  InsightsSummary,
  SalaryStatsGroup,
  SalaryExtremes,
  SalaryDistribution,
} from '../src/types';

function insertEmployee(
  db: Database.Database,
  row: {
    first: string;
    last: string;
    email: string;
    title: string;
    department: string;
    country: string;
    currency: string;
    salary: number;
  }
): void {
  db.prepare(
    `INSERT INTO employees (
      first_name, last_name, email, job_title, department,
      country, currency, salary, hire_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '2020-01-01')`
  ).run(
    row.first,
    row.last,
    row.email,
    row.title,
    row.department,
    row.country,
    row.currency,
    row.salary
  );
}

describe('Insights API (/api/insights)', () => {
  let db: Database.Database;
  let app: Express;

  beforeEach(() => {
    db = initDb({ inMemory: true });
    // Odd count (3) in USD Engineering; even count (4) in EUR Sales; extra Engineering EUR (2)
    const rows = [
      ['A', 'One', 'a@acme.corp', 'Engineer', 'Engineering', 'United States', 'USD', 100],
      ['B', 'Two', 'b@acme.corp', 'Engineer', 'Engineering', 'United States', 'USD', 200],
      ['C', 'Three', 'c@acme.corp', 'Engineer', 'Engineering', 'United States', 'USD', 300],
      ['D', 'Four', 'd@acme.corp', 'Account Executive', 'Sales', 'Germany', 'EUR', 10],
      ['E', 'Five', 'e@acme.corp', 'Account Executive', 'Sales', 'Germany', 'EUR', 20],
      ['F', 'Six', 'f@acme.corp', 'Account Executive', 'Sales', 'Germany', 'EUR', 30],
      ['G', 'Seven', 'g@acme.corp', 'Account Executive', 'Sales', 'Germany', 'EUR', 40],
      ['H', 'Eight', 'h@acme.corp', 'Engineer', 'Engineering', 'Germany', 'EUR', 5],
      ['I', 'Nine', 'i@acme.corp', 'Engineer', 'Engineering', 'Germany', 'EUR', 15],
    ] as const;

    for (const r of rows) {
      insertEmployee(db, {
        first: r[0],
        last: r[1],
        email: r[2],
        title: r[3],
        department: r[4],
        country: r[5],
        currency: r[6],
        salary: r[7],
      });
    }

    app = createApp(db);
  });

  afterEach(() => {
    if (db && db.open) {
      db.close();
    }
  });

  describe('GET /api/insights/summary', () => {
    it('returns headcount, per-country counts with currency, and distinct counts', async () => {
      const res = await request(app).get('/api/insights/summary');
      expect(res.status).toBe(200);
      const body = res.body as InsightsSummary;
      expect(body.totalHeadcount).toBe(9);
      expect(body.totalDepartments).toBe(2);
      expect(body.totalJobTitles).toBe(2);
      expect(body.byCountry).toEqual(
        expect.arrayContaining([
          { country: 'United States', currency: 'USD', headcount: 3 },
          { country: 'Germany', currency: 'EUR', headcount: 6 },
        ])
      );
    });

    it('returns zeros when the table is empty', async () => {
      db.prepare('DELETE FROM employees').run();
      const res = await request(app).get('/api/insights/summary');
      expect(res.status).toBe(200);
      const body = res.body as InsightsSummary;
      expect(body.totalHeadcount).toBe(0);
      expect(body.byCountry).toEqual([]);
      expect(body.totalDepartments).toBe(0);
      expect(body.totalJobTitles).toBe(0);
    });
  });

  describe('GET /api/insights/salary-stats', () => {
    it('computes min, rounded average, median and max per country without mixing currencies', async () => {
      const res = await request(app).get('/api/insights/salary-stats?groupBy=country');
      expect(res.status).toBe(200);
      const groups = res.body as SalaryStatsGroup[];

      const us = groups.find((g) => g.group === 'United States');
      const de = groups.find((g) => g.group === 'Germany');
      expect(us).toMatchObject({
        currency: 'USD',
        headcount: 3,
        min: 100,
        average: 200,
        median: 200,
        max: 300,
      });
      // Germany: 5, 10, 15, 20, 30, 40 — even count, median (15+20)/2 = 18
      expect(de).toMatchObject({
        currency: 'EUR',
        headcount: 6,
        min: 5,
        average: 20,
        median: 18,
        max: 40,
      });
      expect(groups[0].headcount).toBeGreaterThanOrEqual(groups[groups.length - 1].headcount);
    });

    it('splits department and job title groups by currency', async () => {
      const deptRes = await request(app).get('/api/insights/salary-stats?groupBy=department');
      expect(deptRes.status).toBe(200);
      const depts = deptRes.body as SalaryStatsGroup[];
      const eng = depts.filter((g) => g.group === 'Engineering');
      expect(eng).toHaveLength(2);
      expect(eng.map((g) => g.currency).sort()).toEqual(['EUR', 'USD']);

      const usd = eng.find((g) => g.currency === 'USD')!;
      expect(usd).toMatchObject({ headcount: 3, min: 100, average: 200, median: 200, max: 300 });

      const eur = eng.find((g) => g.currency === 'EUR')!;
      expect(eur).toMatchObject({ headcount: 2, min: 5, average: 10, median: 10, max: 15 });

      const sales = depts.find((g) => g.group === 'Sales')!;
      // even count 4: 10,20,30,40 median 25
      expect(sales).toMatchObject({
        currency: 'EUR',
        headcount: 4,
        min: 10,
        average: 25,
        median: 25,
        max: 40,
      });

      const titleRes = await request(app).get(
        '/api/insights/salary-stats?groupBy=jobTitle&country=Germany&department=Sales'
      );
      expect(titleRes.status).toBe(200);
      const titles = titleRes.body as SalaryStatsGroup[];
      expect(titles).toHaveLength(1);
      expect(titles[0]).toMatchObject({
        group: 'Account Executive',
        currency: 'EUR',
        headcount: 4,
        median: 25,
      });
    });

    it('returns an empty list when filters match nothing', async () => {
      const res = await request(app).get(
        '/api/insights/salary-stats?groupBy=department&country=Brazil'
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns 400 when groupBy is missing or invalid', async () => {
      const missing = await request(app).get('/api/insights/salary-stats');
      expect(missing.status).toBe(400);
      expect(missing.body.error).toHaveProperty('message');
      expect(missing.body.error).toHaveProperty('details');

      const bad = await request(app).get('/api/insights/salary-stats?groupBy=salary');
      expect(bad.status).toBe(400);
      expect(bad.body.error.details).toEqual(expect.any(Array));
    });
  });

  describe('GET /api/insights/extremes', () => {
    it('requires a country and returns highest and lowest paid within that currency', async () => {
      const missing = await request(app).get('/api/insights/extremes');
      expect(missing.status).toBe(400);
      expect(missing.body.error.message).toBe('Invalid query parameters');
      expect(JSON.stringify(missing.body.error.details)).toContain('country');

      const res = await request(app).get('/api/insights/extremes?country=Germany&limit=2');
      expect(res.status).toBe(200);
      const body = res.body as SalaryExtremes;
      expect(body.country).toBe('Germany');
      expect(body.currency).toBe('EUR');
      expect(body.highestPaid.map((e) => e.salary)).toEqual([40, 30]);
      expect(body.lowestPaid.map((e) => e.salary)).toEqual([5, 10]);
      for (const emp of [...body.highestPaid, ...body.lowestPaid]) {
        expect(emp.currency).toBe('EUR');
        expect(emp.country).toBe('Germany');
      }
    });

    it('filters extremes by department and returns empty lists for unknown countries', async () => {
      const filtered = await request(app).get(
        '/api/insights/extremes?country=United%20States&department=Engineering&limit=10'
      );
      expect(filtered.status).toBe(200);
      const body = filtered.body as SalaryExtremes;
      expect(body.highestPaid[0].salary).toBe(300);
      expect(body.lowestPaid[0].salary).toBe(100);

      const empty = await request(app).get('/api/insights/extremes?country=Brazil');
      expect(empty.status).toBe(200);
      expect(empty.body.highestPaid).toEqual([]);
      expect(empty.body.lowestPaid).toEqual([]);
    });
  });

  describe('GET /api/insights/distribution', () => {
    it('builds equal-width bands whose counts sum to the country headcount', async () => {
      const res = await request(app).get('/api/insights/distribution?country=United%20States&bands=2');
      expect(res.status).toBe(200);
      const body = res.body as SalaryDistribution;
      expect(body.currency).toBe('USD');
      expect(body.min).toBe(100);
      expect(body.max).toBe(300);
      expect(body.bands).toHaveLength(2);
      const total = body.bands.reduce((sum, band) => sum + band.count, 0);
      expect(total).toBe(3);
      for (const band of body.bands) {
        expect(band.currency).toBe('USD');
        expect(band.bandEnd).toBeGreaterThanOrEqual(band.bandStart);
      }
    });

    it('returns 400 when country is missing and empty bands when the country has no rows', async () => {
      const missing = await request(app).get('/api/insights/distribution');
      expect(missing.status).toBe(400);
      expect(missing.body.error).toHaveProperty('details');

      const empty = await request(app).get('/api/insights/distribution?country=Brazil&bands=5');
      expect(empty.status).toBe(200);
      expect(empty.body.bands).toEqual([]);
      expect(empty.body.min).toBe(0);
      expect(empty.body.max).toBe(0);
    });
  });
});

