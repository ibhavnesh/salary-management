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
  Grid2 as Grid,
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setServerError(null)}>
            {serverError}
          </Alert>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="First Name"
                id={fieldIds.firstName}
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Last Name"
                id={fieldIds.lastName}
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                id={fieldIds.email}
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Job Title"
                id={fieldIds.jobTitle}
                {...register('jobTitle')}
                error={!!errors.jobTitle}
                helperText={errors.jobTitle?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Department"
                id={fieldIds.department}
                {...register('department')}
                error={!!errors.department}
                helperText={errors.department?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
                    size="small"
                    id={fieldIds.country}
                    label="Country"
                    error={!!errors.country}
                    helperText={errors.country?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Currency (3-letter code)"
                id={fieldIds.currency}
                {...register('currency')}
                error={!!errors.currency}
                helperText={errors.currency?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Salary"
                type="number"
                inputMode="numeric"
                id={fieldIds.salary}
                {...register('salary')}
                error={!!errors.salary}
                helperText={errors.salary?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Hire Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                id={fieldIds.hireDate}
                {...register('hireDate')}
                error={!!errors.hireDate}
                helperText={errors.hireDate?.message}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ color: '#4B5563' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSubmitting || isPending}
          sx={{ backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' }, boxShadow: 'none' }}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
