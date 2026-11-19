import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useCreateEmployee, useUpdateEmployee } from '../hooks/useEmployeeMutations';
import { employeeSchema, EmployeeFormData, Employee, FilterOptions } from '../types';

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee;
  filterOptions: FilterOptions;
  onSuccess: (data: EmployeeFormData) => void;
  onError: (message: string) => void;
}

const fieldIds = {
  firstName: 'form-firstName',
  lastName: 'form-lastName',
  email: 'form-email',
  jobTitle: 'form-jobTitle',
  department: 'form-department',
  country: 'form-country',
  currency: 'form-currency',
  salary: 'form-salary',
  hireDate: 'form-hireDate',
} as const;

export default function EmployeeForm({
  open,
  onClose,
  employee,
  filterOptions,
  onSuccess,
  onError,
}: EmployeeFormProps) {
  const isEdit = !!employee;
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const methods = useForm<EmployeeFormData>({
    defaultValues: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          jobTitle: employee.jobTitle,
          department: employee.department,
          country: employee.country,
          currency: employee.currency,
          salary: employee.salary,
          hireDate: employee.hireDate,
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          jobTitle: '',
          department: '',
          country: '',
          currency: 'USD',
          salary: 0,
          hireDate: '',
        },
  });

  const { register, formState: { errors, isSubmitting } } = methods;

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [countryInput, setCountryInput] = React.useState(employee?.country ?? '');
  const countryValue = methods.watch('country');

  const handleCountryChange = (value: string) => {
    setCountryInput(value);
    methods.setValue('country', value, { shouldValidate: true });
  };

  const handleSave = async () => {
    const result = employeeSchema.safeParse(methods.getValues());

    if (!result.success) {
      methods.clearErrors();
      for (const issue of result.error.issues) {
        const path = issue.path.join('.') as keyof EmployeeFormData;
        methods.setError(path, { message: issue.message });
      }
      return;
    }

    setServerError(null);
    const data = result.data;
    const payload = { ...data, salary: Number(data.salary) };

    try {
      if (isEdit && employee) {
        await updateMutation.mutateAsync({ id: employee.id, data: payload as any });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess(data);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Operation failed';
      setServerError(msg);
      onError(msg);
    }
  };

  const title = isEdit ? 'Edit Employee' : 'Add Employee';
  const submitLabel = isEdit ? 'Save' : 'Create';
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ minWidth: 400 }}>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setServerError(null)}>
            {serverError}
          </Alert>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
          <TextField
            fullWidth
            margin="dense"
            label="First Name"
            id={fieldIds.firstName}
            {...register('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Last Name"
            id={fieldIds.lastName}
            {...register('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            type="email"
            id={fieldIds.email}
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Job Title"
            id={fieldIds.jobTitle}
            {...register('jobTitle')}
            error={!!errors.jobTitle}
            helperText={errors.jobTitle?.message}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Department"
            id={fieldIds.department}
            {...register('department')}
            error={!!errors.department}
            helperText={errors.department?.message}
          />
          <Autocomplete
            fullWidth
            freeSolo
            id={fieldIds.country}
            options={filterOptions.countries}
            value={countryValue || null}
            inputValue={countryInput}
            onInputChange={(_, value) => handleCountryChange(value)}
            onChange={(_, value) => handleCountryChange(typeof value === 'string' ? value : value ?? '')}
            renderInput={(params) => (
              <TextField
                {...params}
                id={fieldIds.country}
                label="Country"
                error={!!errors.country}
                helperText={errors.country?.message}
              />
            )}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Currency (3-letter code)"
            id={fieldIds.currency}
            {...register('currency')}
            error={!!errors.currency}
            helperText={errors.currency?.message}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Salary"
            type="number"
            inputMode="numeric"
            id={fieldIds.salary}
            {...register('salary')}
            error={!!errors.salary}
            helperText={errors.salary?.message}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Hire Date (YYYY-MM-DD)"
            type="date"
            id={fieldIds.hireDate}
            {...register('hireDate')}
            error={!!errors.hireDate}
            helperText={errors.hireDate?.message}
          />
        </form>
      </DialogContent>
      <DialogActions sx={{ mt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSubmitting || isPending}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
