import Database from 'better-sqlite3';
import {
  InsightsSummary,
  CountryHeadcount,
  SalaryStatsGroup,
  SalaryStatsQueryParams,
  SalaryExtremes,
  ExtremesQueryParams,
  SalaryDistribution,
  DistributionQueryParams,
  SalaryDistributionBand,
  Employee,
  EmployeeRow,
} from '../types';

export interface IInsightsRepository {
  getSummary(): InsightsSummary;
  getSalaryStats(params: SalaryStatsQueryParams): SalaryStatsGroup[];
  getExtremes(params: ExtremesQueryParams): SalaryExtremes;
  getDistribution(params: DistributionQueryParams): SalaryDistribution;
}

const GROUP_COLUMN_MAP: Record<string, string> = {
  country: 'country',
  department: 'department',
  jobTitle: 'job_title',
  job_title: 'job_title',
};

export class InsightsRepository implements IInsightsRepository {
  constructor(private readonly db: Database.Database) {}

  getSummary(): InsightsSummary {
    const totalRow = this.db.prepare('SELECT COUNT(*) as total FROM employees').get() as { total: number };

    const countryRows = this.db
      .prepare(`
        SELECT country, currency, COUNT(*) as headcount
        FROM employees
        GROUP BY country, currency
        ORDER BY headcount DESC, country ASC
      `)
      .all() as CountryHeadcount[];

    const countsRow = this.db
      .prepare(`
        SELECT
          COUNT(DISTINCT department) as total_departments,
          COUNT(DISTINCT job_title) as total_job_titles
        FROM employees
      `)
      .get() as { total_departments: number; total_job_titles: number };

    return {
      totalHeadcount: totalRow.total,
      byCountry: countryRows,
      totalDepartments: countsRow.total_departments,
      totalJobTitles: countsRow.total_job_titles,
    };
  }

  getSalaryStats(params: SalaryStatsQueryParams): SalaryStatsGroup[] {
    const column = GROUP_COLUMN_MAP[params.groupBy];
    if (!column) {
      throw new Error(`Invalid groupBy column: ${params.groupBy}`);
    }

    const whereClauses: string[] = [];
    const queryParams: (string | number)[] = [];

    if (params.country) {
      whereClauses.push('country = ?');
      queryParams.push(params.country);
    }

    if (params.department) {
      whereClauses.push('department = ?');
      queryParams.push(params.department);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      WITH ranked AS (
        SELECT
          ${column} as grp,
          currency,
          salary,
          ROW_NUMBER() OVER (PARTITION BY ${column}, currency ORDER BY salary ASC) as row_num,
          COUNT(*) OVER (PARTITION BY ${column}, currency) as total_count
        FROM employees
        ${whereSql}
      ),
      medians AS (
        SELECT
          grp,
          currency,
          ROUND(AVG(salary)) as median
        FROM ranked
        WHERE row_num IN ((total_count + 1) / 2, (total_count + 2) / 2)
        GROUP BY grp, currency
      ),
      stats AS (
        SELECT
          ${column} as grp,
          currency,
          COUNT(*) as headcount,
          MIN(salary) as min,
          ROUND(AVG(salary)) as average,
          MAX(salary) as max
        FROM employees
        ${whereSql}
        GROUP BY ${column}, currency
      )
      SELECT
        s.grp as "group",
        s.currency,
        s.headcount,
        s.min,
        CAST(s.average AS INTEGER) as average,
        CAST(m.median AS INTEGER) as median,
        s.max
      FROM stats s
      JOIN medians m ON s.grp = m.grp AND s.currency = m.currency
      ORDER BY s.headcount DESC, s.grp ASC;
    `;

    // Query uses whereSql in both 'ranked' and 'stats' CTEs
    const allParams = [...queryParams, ...queryParams];
    const rows = this.db.prepare(sql).all(...allParams) as Array<{
      group: string;
      currency: string;
      headcount: number;
      min: number;
      average: number;
      median: number;
      max: number;
    }>;

    return rows.map((r) => ({
      group: r.group,
      currency: r.currency,
      headcount: r.headcount,
      min: r.min,
      average: r.average,
      median: r.median,
      max: r.max,
    }));
  }

  getExtremes(params: ExtremesQueryParams): SalaryExtremes {
    const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 10;

    const currencyRow = this.db
      .prepare('SELECT currency FROM employees WHERE country = ? LIMIT 1')
      .get(params.country) as { currency: string } | undefined;

    const currency = currencyRow?.currency || '';

    const whereClauses: string[] = ['country = ?'];
    const queryParams: (string | number)[] = [params.country];

    if (params.department) {
      whereClauses.push('department = ?');
      queryParams.push(params.department);
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    const highestStmt = this.db.prepare(`
      SELECT * FROM employees
      ${whereSql}
      ORDER BY salary DESC, id ASC
      LIMIT ?
    `);
    const highestRows = highestStmt.all(...queryParams, limit) as EmployeeRow[];

    const lowestStmt = this.db.prepare(`
      SELECT * FROM employees
      ${whereSql}
      ORDER BY salary ASC, id ASC
      LIMIT ?
    `);
    const lowestRows = lowestStmt.all(...queryParams, limit) as EmployeeRow[];

    return {
      country: params.country,
      currency,
      highestPaid: highestRows.map((r) => this.mapRowToEmployee(r)),
      lowestPaid: lowestRows.map((r) => this.mapRowToEmployee(r)),
    };
  }

  getDistribution(params: DistributionQueryParams): SalaryDistribution {
    const bandsCount = params.bands && params.bands > 0 ? Math.min(params.bands, 50) : 10;

    const statsRow = this.db
      .prepare(`
        SELECT
          MIN(salary) as min_sal,
          MAX(salary) as max_sal,
          currency,
          COUNT(*) as count
        FROM employees
        WHERE country = ?
      `)
      .get(params.country) as {
      min_sal: number | null;
      max_sal: number | null;
      currency: string | null;
      count: number;
    };

    if (!statsRow || statsRow.count === 0 || statsRow.min_sal === null || statsRow.max_sal === null) {
      return {
        country: params.country,
        currency: statsRow?.currency || '',
        min: 0,
        max: 0,
        bands: [],
      };
    }

    const min = statsRow.min_sal;
    const max = statsRow.max_sal;
    const currency = statsRow.currency || '';
    const totalCount = statsRow.count;

    if (min === max) {
      return {
        country: params.country,
        currency,
        min,
        max,
        bands: [
          {
            bandStart: min,
            bandEnd: max,
            count: totalCount,
            currency,
          },
        ],
      };
    }

    // Query histogram counts using integer bucket assignment
    const bucketSql = `
      SELECT
        MIN(CAST((salary - ?) * ? / (? - ?) AS INTEGER), ? - 1) as band_idx,
        COUNT(*) as count
      FROM employees
      WHERE country = ?
      GROUP BY band_idx
    `;

    const bucketRows = this.db
      .prepare(bucketSql)
      .all(min, bandsCount, max, min, bandsCount, params.country) as Array<{
      band_idx: number;
      count: number;
    }>;

    const countMap = new Map<number, number>();
    for (const row of bucketRows) {
      countMap.set(row.band_idx, row.count);
    }

    const bands: SalaryDistributionBand[] = [];
    const step = (max - min) / bandsCount;

    for (let i = 0; i < bandsCount; i++) {
      const bandStart = Math.round(min + i * step);
      const bandEnd = i === bandsCount - 1 ? max : Math.round(min + (i + 1) * step);
      const count = countMap.get(i) || 0;

      bands.push({
        bandStart,
        bandEnd,
        count,
        currency,
      });
    }

    return {
      country: params.country,
      currency,
      min,
      max,
      bands,
    };
  }

  private mapRowToEmployee(row: EmployeeRow): Employee {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      jobTitle: row.job_title,
      department: row.department,
      country: row.country,
      currency: row.currency,
      salary: row.salary,
      hireDate: row.hire_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
