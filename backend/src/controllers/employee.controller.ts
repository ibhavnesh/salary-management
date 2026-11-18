import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { EmployeeService } from '../services';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  ValidationError,
} from '../types';

function formatZodErrors(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  getEmployees = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = employeeQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query parameters', formatZodErrors(parsed.error));
      }

      const result = this.employeeService.listEmployees(parsed.data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getFilters = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const filters = this.employeeService.getFilterOptions();
      res.json(filters);
    } catch (err) {
      next(err);
    }
  };

  getEmployeeById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        throw new ValidationError('Invalid employee ID', [
          { field: 'id', message: 'Employee ID must be a positive integer' },
        ]);
      }

      const employee = this.employeeService.getEmployeeById(id);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  };

  createEmployee = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = createEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', formatZodErrors(parsed.error));
      }

      const created = this.employeeService.createEmployee(parsed.data);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  };

  updateEmployee = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        throw new ValidationError('Invalid employee ID', [
          { field: 'id', message: 'Employee ID must be a positive integer' },
        ]);
      }

      const parsed = updateEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', formatZodErrors(parsed.error));
      }

      const updated = this.employeeService.updateEmployee(id, parsed.data);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  deleteEmployee = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        throw new ValidationError('Invalid employee ID', [
          { field: 'id', message: 'Employee ID must be a positive integer' },
        ]);
      }

      this.employeeService.deleteEmployee(id);
      res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (err) {
      next(err);
    }
  };
}
