import Database from 'better-sqlite3';
import { Employee, EmployeeRow } from '../types';

export interface IEmployeeRepository {
  findById(id: number): Employee | null;
  count(): number;
}

export class EmployeeRepository implements IEmployeeRepository {
  constructor(private readonly db: Database.Database) {}

  findById(id: number): Employee | null {
    const stmt = this.db.prepare<[number], EmployeeRow>(
      'SELECT * FROM employees WHERE id = ?'
    );
    const row = stmt.get(id);
    return row ? this.mapRowToEmployee(row) : null;
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
