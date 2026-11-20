import {
  Employee,
  EmployeePage,
  FilterOptions,
  EmployeeFilters,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  InsightsSummary,
  SalaryStatsGroup,
  SalaryStatsParams,
  SalaryExtremes,
  ExtremesParams,
  SalaryDistribution,
  DistributionParams,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? 'http://localhost:3001' : ''
);

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  // FIX: second argument lets a relative path (production, same origin) resolve correctly
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, String(value));
      }
    }
  }
  return url.toString();
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const employeesApi = {
  list: (filters: EmployeeFilters): Promise<EmployeePage> =>
    fetchJson<EmployeePage>(
      buildUrl('/api/employees', {
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search,
        country: filters.country,
        department: filters.department,
        jobTitle: filters.jobTitle,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
    ),

  filters: (): Promise<FilterOptions> =>
    fetchJson<FilterOptions>(buildUrl('/api/employees/filters')),

  create: (data: CreateEmployeeInput): Promise<Employee> =>
    fetchJson<Employee>(`${API_BASE}/api/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateEmployeeInput): Promise<Employee> =>
    fetchJson<Employee>(`${API_BASE}/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<void> =>
    fetchJson<void>(`${API_BASE}/api/employees/${id}`, {
      method: 'DELETE',
    }),
};

export const insightsApi = {
  summary: (): Promise<InsightsSummary> =>
    fetchJson<InsightsSummary>(buildUrl('/api/insights/summary')),

  salaryStats: (params: SalaryStatsParams): Promise<SalaryStatsGroup[]> =>
    fetchJson<SalaryStatsGroup[]>(
      buildUrl('/api/insights/salary-stats', {
        groupBy: params.groupBy,
        country: params.country,
        department: params.department,
      })
    ),

  extremes: (params: ExtremesParams): Promise<SalaryExtremes> =>
    fetchJson<SalaryExtremes>(
      buildUrl('/api/insights/extremes', {
        country: params.country,
        limit: params.limit,
        department: params.department,
      })
    ),

  distribution: (params: DistributionParams): Promise<SalaryDistribution> =>
    fetchJson<SalaryDistribution>(
      buildUrl('/api/insights/distribution', {
        country: params.country,
        bands: params.bands,
      })
    ),
};