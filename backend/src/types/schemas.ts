import { z } from 'zod';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const createEmployeeSchema = z.preprocess(
  (val: unknown) => {
    if (val && typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      return {
        firstName: obj.firstName ?? obj.first_name,
        lastName: obj.lastName ?? obj.last_name,
        email: obj.email,
        jobTitle: obj.jobTitle ?? obj.job_title,
        department: obj.department,
        country: obj.country,
        currency: obj.currency,
        salary: obj.salary,
        hireDate: obj.hireDate ?? obj.hire_date,
      };
    }
    return val;
  },
  z.object({
    firstName: z
      .string({ required_error: 'First name is required' })
      .trim()
      .min(1, 'First name is required'),
    lastName: z
      .string({ required_error: 'Last name is required' })
      .trim()
      .min(1, 'Last name is required'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address')
      .toLowerCase(),
    jobTitle: z
      .string({ required_error: 'Job title is required' })
      .trim()
      .min(1, 'Job title is required'),
    department: z
      .string({ required_error: 'Department is required' })
      .trim()
      .min(1, 'Department is required'),
    country: z
      .string({ required_error: 'Country is required' })
      .trim()
      .min(1, 'Country is required'),
    currency: z
      .string({ required_error: 'Currency is required' })
      .trim()
      .length(3, 'Currency must be a 3-letter code')
      .toUpperCase(),
    salary: z.coerce
      .number({ required_error: 'Salary is required', invalid_type_error: 'Salary must be a number' })
      .int('Salary must be an integer')
      .positive('Salary must be a positive integer'),
    hireDate: z
      .string({ required_error: 'Hire date is required' })
      .trim()
      .refine(
        (dateStr) => {
          if (!ISO_DATE_REGEX.test(dateStr)) return false;
          const parsed = new Date(dateStr);
          if (isNaN(parsed.getTime())) return false;
          // Ensure it matches calendar date
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
  })
);

export const updateEmployeeSchema = createEmployeeSchema;

export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().optional(),
  country: z.string().trim().optional(),
  department: z.string().trim().optional(),
  jobTitle: z.string().trim().optional(),
  minSalary: z.coerce.number().int().nonnegative().optional(),
  maxSalary: z.coerce.number().int().positive().optional(),
  sortBy: z
    .enum(['salary', 'hire_date', 'last_name', 'country', 'department', 'hireDate', 'lastName'])
    .transform((val) => {
      if (val === 'hireDate') return 'hire_date';
      if (val === 'lastName') return 'last_name';
      return val;
    })
    .optional(),
  sortOrder: z
    .string()
    .toLowerCase()
    .pipe(z.enum(['asc', 'desc']))
    .default('asc'),
});

export const salaryStatsQuerySchema = z.object({
  groupBy: z
    .enum(['country', 'department', 'jobTitle', 'job_title'], {
      required_error: 'groupBy parameter is required (country, department, or jobTitle)',
      invalid_type_error: 'groupBy must be country, department, or jobTitle',
    })
    .transform((val) => {
      if (val === 'job_title') return 'jobTitle';
      return val as 'country' | 'department' | 'jobTitle';
    }),
  country: z.string().trim().optional(),
  department: z.string().trim().optional(),
});

export const extremesQuerySchema = z.object({
  country: z
    .string({ required_error: 'country is required for salary extremes' })
    .trim()
    .min(1, 'country is required for salary extremes'),
  department: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const distributionQuerySchema = z.object({
  country: z
    .string({ required_error: 'country is required for salary distribution' })
    .trim()
    .min(1, 'country is required for salary distribution'),
  bands: z.coerce.number().int().min(1).max(50).default(10),
});
