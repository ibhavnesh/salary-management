import { z } from 'zod';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  hireDate: string;
}

export interface EmployeePage {
  data: Employee[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FilterOptions {
  countries: string[];
  departments: string[];
  jobTitles: string[];
}

export interface EmployeeFilters {
  search?: string;
  country?: string;
  department?: string;
  jobTitle?: string;
  minSalary?: number;
  maxSalary?: number;
  sortBy?: 'salary' | 'hire_date' | 'last_name' | 'country' | 'department';
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export type CreateEmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

// Shared zod validation schema matching backend rules
export const employeeSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .toLowerCase(),
  jobTitle: z
    .string()
    .trim()
    .min(1, 'Job title is required'),
  department: z
    .string()
    .trim()
    .min(1, 'Department is required'),
  country: z
    .string()
    .trim()
    .min(1, 'Country is required'),
  currency: z
    .string()
    .trim()
    .min(1, 'Currency is required')
    .length(3, 'Currency must be a 3-letter code')
    .toUpperCase(),
  salary: z.preprocess(
    (val) => String(val),
    z.string()
      .min(1, 'Salary is required')
      .refine(
        (val) => {
          const num = Number(val);
          return !isNaN(num) && Number.isInteger(num) && num > 0;
        },
        'Salary must be a positive integer'
      )
      .transform((val) => Number(val))
  ),
  hireDate: z
    .string()
    .trim()
    .min(1, 'Hire date is required')
    .refine(
      (dateStr) => {
        if (!ISO_DATE_REGEX.test(dateStr)) return false;
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) return false;
        const [year, month, day] = dateStr.split('-').map(Number);
        if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() + 1 !== month || parsed.getUTCDate() !== day) {
          return false;
        }
        const today = new Date();
        today.setUTCHours(23, 59, 59, 999);
        return parsed <= today;
      },
      { message: 'Hire date must be a valid ISO date (YYYY-MM-DD) not in the future' }
    ),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
