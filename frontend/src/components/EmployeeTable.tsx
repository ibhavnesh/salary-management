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
  Chip,
  Box,
  Skeleton,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import { Employee } from '../types';
import { formatSalary } from '../hooks/useFormatSalary';

const sortableColumns: Array<{ key: string; label: string; align?: 'right' | 'left' }> = [
  { key: 'lastName', label: 'Name' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'department', label: 'Department' },
  { key: 'country', label: 'Country' },
  { key: 'salary', label: 'Salary', align: 'right' },
  { key: 'hireDate', label: 'Hire Date' },
];

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (v: string) => void;
  onResetFilters: () => void;
}

const departmentColors: Record<string, { bg: string; color: string }> = {
  Engineering: { bg: '#EFF6FF', color: '#1D4ED8' },
  Sales: { bg: '#F0FDF4', color: '#15803D' },
  Marketing: { bg: '#FAF5FF', color: '#7E22CE' },
  HR: { bg: '#FFF7ED', color: '#C2410C' },
  Finance: { bg: '#FEF2F2', color: '#B91C1C' },
  Operations: { bg: '#F8FAFC', color: '#475569' },
  Product: { bg: '#FDF4F8', color: '#BE185D' },
  Support: { bg: '#F0FDFA', color: '#0F766E' },
};

export default function EmployeeTable({
  employees,
  isLoading,
  onSort,
  currentSortBy,
  currentSortOrder,
  onEdit,
  onDelete,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
}: EmployeeTableProps) {
  const handleSort = (key: string) => {
    const mappedKey = key === 'lastName' ? 'last_name' : key === 'hireDate' ? 'hire_date' : key;
    const nextOrder =
      currentSortBy === mappedKey && currentSortOrder === 'asc' ? 'desc' : 'asc';
    onSort(mappedKey, nextOrder);
  };

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <TableContainer
      component={Paper}
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            {sortableColumns.map((col) => {
              const mappedKey = col.key === 'lastName' ? 'last_name' : col.key === 'hireDate' ? 'hire_date' : col.key;
              const isActive = currentSortBy === mappedKey;
              return (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  onClick={() => handleSort(col.key)}
                  sx={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: '#F9FAFB',
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    py: 1.5,
                  }}
                >
                  {col.label}
                  {isActive && (currentSortOrder === 'asc' ? ' ▲' : ' ▼')}
                </TableCell>
              );
            })}
            <TableCell
              align="right"
              sx={{
                backgroundColor: '#F9FAFB',
                fontWeight: 600,
                color: '#374151',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                py: 1.5,
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from(new Array(5)).map((_, idx) => (
              <TableRow key={idx}>
                {Array.from(new Array(7)).map((__, cIdx) => (
                  <TableCell key={cIdx}>
                    <Skeleton variant="text" width="80%" height={24} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  <PersonOutlineIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    No employees found matching your criteria.
                  </Typography>
                  <Button variant="outlined" size="small" onClick={onResetFilters} sx={{ mt: 1 }}>
                    Reset filters
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            employees.map((emp) => {
              const deptStyle = departmentColors[emp.department] || { bg: '#F3F4F6', color: '#374151' };
              return (
                <TableRow
                  key={emp.id}
                  hover
                  sx={{
                    height: 48,
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
                      {emp.firstName} {emp.lastName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {emp.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#374151' }}>
                      {emp.jobTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={emp.department}
                      size="small"
                      sx={{
                        backgroundColor: deptStyle.bg,
                        color: deptStyle.color,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: 24,
                        borderRadius: '6px',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#374151' }}>
                      {emp.country}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#111827' }}
                    >
                      {formatSalary(emp.salary, emp.currency)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', lineHeight: 1 }}>
                      {emp.currency}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#4B5563' }}>
                      {emp.hireDate}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ paddingRight: 2 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onEdit(emp); }}
                        sx={{ color: '#4B5563', '&:hover': { color: '#2563EB', backgroundColor: '#EFF6FF' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        data-testid="delete-employee-button"
                        onClick={(e) => { e.stopPropagation(); onDelete(emp); }}
                        sx={{ color: '#9CA3AF', '&:hover': { color: '#DC2626', backgroundColor: '#FEF2F2' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#FAFAFA',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: '#4B5563' }}>
          Showing <b>{startItem}</b>–<b>{endItem}</b> of <b>{total.toLocaleString()}</b> employees
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ color: '#6B7280' }}>Rows:</Typography>
            <Select
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(e.target.value)}
              size="small"
              sx={{ height: 32, fontSize: '0.875rem', backgroundColor: '#FFFFFF' }}
            >
              {[10, 25, 50, 100].map((size) => (
                <MenuItem key={size} value={String(size)}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              sx={{ height: 32, borderColor: '#D1D5DB', color: '#374151' }}
            >
              Prev
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              sx={{ height: 32, borderColor: '#D1D5DB', color: '#374151' }}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      </Box>
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
    setLocalSearch(search);
  }, [search]);

  React.useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) clearTimeout(debouncedSearchRef.current);
    };
  }, []);

  return (
    <Paper
      sx={{
        p: 2.5,
        mb: 3,
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '2fr repeat(3, 1fr) auto' },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search by name, email, or job title..."
          value={localSearch}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl fullWidth size="small">
          <InputLabel>Country</InputLabel>
          <Select
            value={country}
            label="Country"
            onChange={(e) => onFilterChange('country', e.target.value || '')}
          >
            <MenuItem value="">All countries</MenuItem>
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
            <MenuItem value="">All departments</MenuItem>
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
            <MenuItem value="">All job titles</MenuItem>
            {jobTitles.map((j) => (
              <MenuItem key={j} value={j}>
                {j}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="text"
          size="medium"
          onClick={onReset}
          disabled={isFilterLoading}
          sx={{ color: '#4B5563', fontWeight: 500, whiteSpace: 'nowrap', '&:hover': { backgroundColor: '#F3F4F6' } }}
        >
          Reset filters
        </Button>
      </Box>
    </Paper>
  );
}
