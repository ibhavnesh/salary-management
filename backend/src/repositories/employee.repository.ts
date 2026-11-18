import Database from 'better-sqlite3';
import {
  Employee,
  EmployeeRow,
  EmployeeQueryParams,
  EmployeeFilterOptions,
  CreateEmployeeInput,
} from '../types';

export interface IEmployeeRepository {
  findAndCount(params: EmployeeQueryParams): { data: Employee[]; total: number };
  getFilterOptions(): EmployeeFilterOptions;
  findById(id: number): Employee | null;
  findByEmail(email: string): Employee | null;
  create(input: CreateEmployeeInput): Employee;
  update(id: number, input: CreateEmployeeInput): Employee | null;
  delete(id: number): boolean;
  count(): number;
}

const SORT_COLUMN_WHITELIST: Record<string, string> = {
  salary: 'salary',
  hire_date: 'hire_date',
  last_name: 'last_name',
  country: 'country',
  department: 'department',
};

export class EmployeeRepository implements IEmployeeRepository {
  constructor(private readonly db: Database.Database) {}

  findAndCount(params: EmployeeQueryParams): { data: Employee[]; total: number } {
    const whereClauses: string[] = [];
    const queryParams: (string | number)[] = [];

    if (params.search) {
      const term = `%${params.search}%`;
      whereClauses.push(
        '(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR job_title LIKE ?)'
      );
      queryParams.push(term, term, term, term);
    }

    if (params.country) {
      whereClauses.push('country = ?');
      queryParams.push(params.country);
    }

    if (params.department) {
      whereClauses.push('department = ?');
      queryParams.push(params.department);
    }

    if (params.jobTitle) {
      whereClauses.push('job_title = ?');
      queryParams.push(params.jobTitle);
    }

    if (params.minSalary !== undefined) {
      whereClauses.push('salary >= ?');
      queryParams.push(params.minSalary);
    }

    if (params.maxSalary !== undefined) {
      whereClauses.push('salary <= ?');
      queryParams.push(params.maxSalary);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count query
    const countStmt = this.db.prepare(`SELECT COUNT(*) as total FROM employees ${whereSql}`);
    const countResult = countStmt.get(...queryParams) as { total: number };
    const total = countResult.total;

    // Sorting with whitelist
    const sortColumn = params.sortBy ? SORT_COLUMN_WHITELIST[params.sortBy] || 'id' : 'id';
    const sortOrder = params.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? Math.min(params.pageSize, 100) : 25;
    const offset = (page - 1) * pageSize;

    const dataStmt = this.db.prepare(`
      SELECT * FROM employees
      ${whereSql}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `);

    const rows = dataStmt.all(...queryParams, pageSize, offset) as EmployeeRow[];
    const data = rows.map((row) => this.mapRowToEmployee(row));

    return { data, total };
  }

  getFilterOptions(): EmployeeFilterOptions {
    const countries = (
      this.db
        .prepare('SELECT DISTINCT country FROM employees ORDER BY country ASC')
        .all() as Array<{ country: string }>
    ).map((r) => r.country);

    const departments = (
      this.db
        .prepare('SELECT DISTINCT department FROM employees ORDER BY department ASC')
        .all() as Array<{ department: string }>
    ).map((r) => r.department);

    const jobTitles = (
      this.db
        .prepare('SELECT DISTINCT job_title FROM employees ORDER BY job_title ASC')
        .all() as Array<{ job_title: string }>
    ).map((r) => r.job_title);

    return { countries, departments, jobTitles };
  }

  findById(id: number): Employee | null {
    const stmt = this.db.prepare('SELECT * FROM employees WHERE id = ?');
    const row = stmt.get(id) as EmployeeRow | undefined;
    return row ? this.mapRowToEmployee(row) : null;
  }

  findByEmail(email: string): Employee | null {
    const stmt = this.db.prepare('SELECT * FROM employees WHERE email = ?');
    const row = stmt.get(email) as EmployeeRow | undefined;
    return row ? this.mapRowToEmployee(row) : null;
  }

  create(input: CreateEmployeeInput): Employee {
    const stmt = this.db.prepare(`
      INSERT INTO employees (
        first_name, last_name, email, job_title, department,
        country, currency, salary, hire_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.firstName,
      input.lastName,
      input.email,
      input.jobTitle,
      input.department,
      input.country,
      input.currency,
      input.salary,
      input.hireDate
    );

    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error('Failed to retrieve created employee');
    }
    return created;
  }

  update(id: number, input: CreateEmployeeInput): Employee | null {
    const stmt = this.db.prepare(`
      UPDATE employees
      SET first_name = ?,
          last_name = ?,
          email = ?,
          job_title = ?,
          department = ?,
          country = ?,
          currency = ?,
          salary = ?,
          hire_date = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `);

    const result = stmt.run(
      input.firstName,
      input.lastName,
      input.email,
      input.jobTitle,
      input.department,
      input.country,
      input.currency,
      input.salary,
      input.hireDate,
      id
    );

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM employees WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as total FROM employees');
    const result = stmt.get() as { total: number };
    return result.total;
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
