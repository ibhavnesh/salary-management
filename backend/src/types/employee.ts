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
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  hire_date: string;
  created_at: string;
  updated_at: string;
}

export type CreateEmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

export interface EmployeeQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  country?: string;
  department?: string;
  jobTitle?: string;
  minSalary?: number;
  maxSalary?: number;
  sortBy?: 'salary' | 'hire_date' | 'last_name' | 'country' | 'department';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedEmployeesResponse {
  data: Employee[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface EmployeeFilterOptions {
  countries: string[];
  departments: string[];
  jobTitles: string[];
}
