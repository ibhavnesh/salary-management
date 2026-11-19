import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../api/client';
import { EmployeePage, FilterOptions, EmployeeFilters } from '../types';

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeesApi.list(filters),
  }) as ReturnType<typeof useQuery<EmployeePage, Error>>;
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['employees', 'filters'],
    queryFn: employeesApi.filters,
  }) as ReturnType<typeof useQuery<FilterOptions, Error>>;
}
