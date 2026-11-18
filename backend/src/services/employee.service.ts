import { IEmployeeRepository } from '../repositories';
import {
  Employee,
  EmployeeQueryParams,
  PaginatedEmployeesResponse,
  EmployeeFilterOptions,
  CreateEmployeeInput,
  NotFoundError,
  ConflictError,
} from '../types';

export class EmployeeService {
  constructor(private readonly employeeRepo: IEmployeeRepository) {}

  listEmployees(params: EmployeeQueryParams): PaginatedEmployeesResponse {
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? Math.min(params.pageSize, 100) : 25;

    const { data, total } = this.employeeRepo.findAndCount({
      ...params,
      page,
      pageSize,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      data,
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  getFilterOptions(): EmployeeFilterOptions {
    return this.employeeRepo.getFilterOptions();
  }

  getEmployeeById(id: number): Employee {
    const employee = this.employeeRepo.findById(id);
    if (!employee) {
      throw new NotFoundError(`Employee with id ${id} not found`);
    }
    return employee;
  }

  createEmployee(data: CreateEmployeeInput): Employee {
    const existing = this.employeeRepo.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Employee with this email already exists');
    }

    try {
      return this.employeeRepo.create(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
        throw new ConflictError('Employee with this email already exists');
      }
      throw err;
    }
  }

  updateEmployee(id: number, data: CreateEmployeeInput): Employee {
    const current = this.employeeRepo.findById(id);
    if (!current) {
      throw new NotFoundError(`Employee with id ${id} not found`);
    }

    const existingWithEmail = this.employeeRepo.findByEmail(data.email);
    if (existingWithEmail && existingWithEmail.id !== id) {
      throw new ConflictError('Employee with this email already exists');
    }

    try {
      const updated = this.employeeRepo.update(id, data);
      if (!updated) {
        throw new NotFoundError(`Employee with id ${id} not found`);
      }
      return updated;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
        throw new ConflictError('Employee with this email already exists');
      }
      throw err;
    }
  }

  deleteEmployee(id: number): void {
    const current = this.employeeRepo.findById(id);
    if (!current) {
      throw new NotFoundError(`Employee with id ${id} not found`);
    }

    const deleted = this.employeeRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Employee with id ${id} not found`);
    }
  }
}
