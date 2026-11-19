import React from 'react';
import {
  Button,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { Employee } from '../types';
import { formatSalary } from '../hooks/useFormatSalary';

const sortableColumns: Array<{ key: string; label: string }> = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'department', label: 'Department' },
  { key: 'country', label: 'Country' },
  { key: 'currency', label: 'Currency' },
  { key: 'salary', label: 'Salary' },
  { key: 'hireDate', label: 'Hire Date' },
];

interface EmployeeTableProps {
  employees: Employee[];
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export default function EmployeeTable({
  employees,
  onSort,
  currentSortBy,
  currentSortOrder,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const handleSort = (key: string) => {
    const nextOrder =
      currentSortBy === key && currentSortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, nextOrder);
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {sortableColumns.map((col) => (
              <TableCell
                key={col.key}
                onClick={() => handleSort(col.key)}
                sx={{ cursor: 'pointer' }}
              >
                {col.label}
                {currentSortBy === col.key && (
                  currentSortOrder === 'asc' ? ' ▲' : ' ▼'
                )}
              </TableCell>
            ))}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={sortableColumns.length + 1} align="center">
                No employees found.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.firstName}</TableCell>
                <TableCell>{emp.lastName}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.jobTitle}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>{emp.country}</TableCell>
                <TableCell>{emp.currency}</TableCell>
                <TableCell>{formatSalary(emp.salary, emp.currency)}</TableCell>
                <TableCell>{emp.hireDate}</TableCell>
                <TableCell align="right" sx={{ paddingRight: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(emp); }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" data-testid="delete-employee-button" onClick={(e) => { e.stopPropagation(); onDelete(emp); }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export interface DirectoryControlsProps {
  search: string;
  onSearchChange: (v: string) => void;
  country: string;
  department: string;
  jobTitle: string;
  onFilterChange: (k: string, v: string) => void;
  countries: string[];
  departments: string[];
  jobTitles: string[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (v: string) => void;
  onReset: () => void;
  isFilterLoading: boolean;
}

export function DirectoryControls({
  search,
  onSearchChange,
  country,
  department,
  jobTitle,
  onFilterChange,
  countries,
  departments,
  jobTitles,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onReset,
  isFilterLoading,
}: DirectoryControlsProps) {
  const debouncedSearchRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [localSearch, setLocalSearch] = React.useState(search);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocalSearch(v);
    if (debouncedSearchRef.current) clearTimeout(debouncedSearchRef.current);
    debouncedSearchRef.current = setTimeout(() => {
      onSearchChange(v);
    }, 300);
  };

  React.useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) clearTimeout(debouncedSearchRef.current);
    };
  }, []);

  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        label="Search (name, email, job title)"
        value={localSearch}
        onChange={handleSearchChange}
        size="small"
      />
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <FormControl fullWidth size="small">
          <InputLabel>Country</InputLabel>
          <Select
            value={country}
            label="Country"
            onChange={(e) => onFilterChange('country', e.target.value || '')}
          >
            <MenuItem value="">All</MenuItem>
            {countries.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Department</InputLabel>
          <Select
            value={department}
            label="Department"
            onChange={(e) => onFilterChange('department', e.target.value || '')}
          >
            <MenuItem value="">All</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Job Title</InputLabel>
          <Select
            value={jobTitle}
            label="Job Title"
            onChange={(e) => onFilterChange('jobTitle', e.target.value || '')}
          >
            <MenuItem value="">All</MenuItem>
            {jobTitles.map((j) => (
              <MenuItem key={j} value={j}>
                {j}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button variant="outlined" size="small" onClick={onReset} disabled={isFilterLoading}>
          Reset filters
        </Button>
        <Typography sx={{ flexGrow: 1 }} />
        <Typography>
          {total} employee{total !== 1 ? 's' : ''} &bull; Page {page} of {totalPages}
        </Typography>
        <Select
          value={String(pageSize)}
          label="Rows per page"
          onChange={(e) => onPageSizeChange(e.target.value)}
          size="small"
          displayEmpty
        >
          {[10, 25, 50, 100].map((size) => (
            <MenuItem key={size} value={String(size)}>
              {size}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </Stack>
    </Stack>
  );
}
