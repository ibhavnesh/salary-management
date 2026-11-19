import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { employeesApi } from '../api/client';
import {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '../types';

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation<Employee, Error, CreateEmployeeInput>({
    mutationFn: employeesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', 'filters'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation<Employee, Error, { id: number; data: UpdateEmployeeInput }>({
    mutationFn: ({ id, data }) => employeesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', 'filters'] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: employeesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', 'filters'] });
    },
  });
}
