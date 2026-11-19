import {
  Box,
  CircularProgress,
  Paper,
  TableContainer,
  Alert,
  Typography,
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEmployees, useFilterOptions } from '../hooks/useEmployees';
import { useDeleteEmployee } from '../hooks/useEmployeeMutations';
import EmployeeTable, { DirectoryControls } from '../components/EmployeeTable';
import EmployeeForm from '../components/EmployeeForm';
import { Employee, FilterOptions } from '../types';

export default function EmployeesPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = React.useState({
    search: '',
    country: '',
    department: '',
    jobTitle: '',
    sortBy: 'hireDate',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const { data, isLoading, error, refetch } = useEmployees({
    page,
    pageSize,
    search: filters.search || undefined,
    country: filters.country || undefined,
    department: filters.department || undefined,
    jobTitle: filters.jobTitle || undefined,
    minSalary: undefined,
    maxSalary: undefined,
    sortBy: filters.sortBy as 'salary' | 'hire_date' | 'last_name' | 'country' | 'department',
    sortOrder: filters.sortOrder,
  });

  const { data: filterData, isLoading: isFilterLoading } = useFilterOptions();

  const deleteMutation = useDeleteEmployee();

  // Dialog state
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | undefined>(
    undefined
  );

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [employeeToDelete, setEmployeeToDelete] = React.useState<Employee | null>(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      country: '',
      department: '',
      jobTitle: '',
      sortBy: 'hireDate',
      sortOrder: 'desc',
    });
    setPage(1);
    setPageSize(25);
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const handleSearchChange = (v: string) => {
    setFilters((prev) => ({ ...prev, search: v }));
    setPage(1);
  };

  const handlePageChange = (p: number) => setPage(p);
  const handlePageSizeChange = (v: string) => {
    setPageSize(Number(v));
    setPage(1);
  };

  const handleAdd = () => {
    setEditingEmployee(undefined);
    setFormOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingEmployee(undefined);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setEmployeeToDelete(null);
  };

  const handleShowSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCreateSuccess = () => {
    handleFormClose();
    handleShowSnackbar('Employee created successfully', 'success');
  };

  const handleUpdateSuccess = () => {
    handleFormClose();
    handleShowSnackbar('Employee updated successfully', 'success');
  };

  const handleError = (message: string) => {
    handleShowSnackbar(message, 'error');
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteMutation.mutateAsync(employeeToDelete.id);
      handleDeleteClose();
      handleShowSnackbar('Employee deleted successfully', 'success');
    } catch (err: any) {
      const msg = err.message || 'Failed to delete employee';
      handleShowSnackbar(msg, 'error');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 1 }}>Loading…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4 }}>
        <Alert severity="error">{error.message}</Alert>
        <Button variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  const employees = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const filterOptions: FilterOptions = filterData || { countries: [], departments: [], jobTitles: [] };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper sx={{ padding: 2 }}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add employee
          </Button>
          <Typography sx={{ flexGrow: 1 }} />
        </Stack>
        <DirectoryControls
          search={filters.search}
          onSearchChange={handleSearchChange}
          country={filters.country}
          department={filters.department}
          jobTitle={filters.jobTitle}
          onFilterChange={handleFilterChange}
          countries={filterOptions.countries}
          departments={filterOptions.departments}
          jobTitles={filterOptions.jobTitles}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onReset={handleReset}
          isFilterLoading={isFilterLoading}
        />
      </Paper>
      <TableContainer sx={{ mt: 2 }}>
        <EmployeeTable
          employees={employees}
          onSort={handleSortChange}
          currentSortBy={filters.sortBy}
          currentSortOrder={filters.sortOrder}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableContainer>

      <EmployeeForm
        open={formOpen}
        onClose={handleFormClose}
        employee={editingEmployee}
        filterOptions={filterOptions}
        onSuccess={editingEmployee ? handleUpdateSuccess : handleCreateSuccess}
        onError={handleError}
      />

      <DialogDeleteConfirm
        open={deleteOpen}
        onClose={handleDeleteClose}
        employee={employeeToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

interface DialogDeleteConfirmProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DialogDeleteConfirm({
  open,
  onClose,
  employee,
  onConfirm,
  isDeleting,
}: DialogDeleteConfirmProps) {
  const message = employee
    ? `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`
    : 'Are you sure you want to delete this employee?';

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Employee</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
