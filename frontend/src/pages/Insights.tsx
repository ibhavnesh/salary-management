import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFilterOptions } from '../hooks/useEmployees';
import { formatSalary } from '../hooks/useFormatSalary';
import {
  useInsightsSummary,
  useSalaryDistribution,
  useSalaryExtremes,
  useSalaryStats,
} from '../hooks/useInsights';
import {
  Employee,
  SalaryStatsGroup,
  SalaryStatsGroupBy,
} from '../types';

const GROUP_BY_OPTIONS: { value: SalaryStatsGroupBy; label: string }[] = [
  { value: 'country', label: 'Country' },
  { value: 'department', label: 'Department' },
  { value: 'jobTitle', label: 'Job title' },
];

function CurrencyNote() {
  return (
    <Alert severity="info" sx={{ mb: 2 }} role="note">
      Salaries use different currencies. Figures are never mixed across currencies — each
      number, table row, and chart axis is labeled with its currency.
    </Alert>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}
      role="status"
      aria-label={label}
    >
      <CircularProgress size={28} />
      <Typography sx={{ ml: 1 }}>{label}</Typography>
    </Box>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <Alert severity="error" sx={{ my: 1 }}>
      {message}
    </Alert>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <Typography color="text.secondary" sx={{ py: 2 }}>
      {message}
    </Typography>
  );
}

function SummarySection() {
  const { data, isLoading, error } = useInsightsSummary();

  if (isLoading) return <LoadingBlock label="Loading summary…" />;
  if (error) return <ErrorBlock message={error.message} />;
  if (!data) return <EmptyBlock message="No summary data." />;

  const cards = [
    { label: 'Total headcount', value: data.totalHeadcount.toLocaleString() },
    { label: 'Countries', value: String(data.byCountry.length) },
    { label: 'Departments', value: String(data.totalDepartments) },
    { label: 'Job titles', value: String(data.totalJobTitles) },
  ];

  return (
    <Box>
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" aria-label={card.label}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="h4" component="p">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}>
        Headcount by country
      </Typography>
      {data.byCountry.length === 0 ? (
        <EmptyBlock message="No country headcount data." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label="Headcount by country">
            <TableHead>
              <TableRow>
                <TableCell>Country</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell align="right">Headcount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.byCountry.map((row) => (
                <TableRow key={row.country}>
                  <TableCell>{row.country}</TableCell>
                  <TableCell>{row.currency}</TableCell>
                  <TableCell align="right">{row.headcount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

function SalaryStatsTable({ rows }: { rows: SalaryStatsGroup[] }) {
  return (
    <TableContainer component={Paper} variant="outlined" data-testid="salary-stats-table">
      <Table size="small" aria-label="Salary statistics by group">
        <TableHead>
          <TableRow>
            <TableCell>Group</TableCell>
            <TableCell>Currency</TableCell>
            <TableCell align="right">Headcount</TableCell>
            <TableCell align="right">Min</TableCell>
            <TableCell align="right">Average</TableCell>
            <TableCell align="right">Median</TableCell>
            <TableCell align="right">Max</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.group}-${row.currency}`}>
              <TableCell>{row.group}</TableCell>
              <TableCell>{row.currency}</TableCell>
              <TableCell align="right">{row.headcount.toLocaleString()}</TableCell>
              <TableCell align="right">{formatSalary(row.min, row.currency)}</TableCell>
              <TableCell align="right">{formatSalary(row.average, row.currency)}</TableCell>
              <TableCell align="right">{formatSalary(row.median, row.currency)}</TableCell>
              <TableCell align="right">{formatSalary(row.max, row.currency)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AverageSalaryCharts({ rows }: { rows: SalaryStatsGroup[] }) {
  const byCurrency = React.useMemo(() => {
    const map = new Map<string, SalaryStatsGroup[]>();
    for (const row of rows) {
      const list = map.get(row.currency) ?? [];
      list.push(row);
      map.set(row.currency, list);
    }
    return Array.from(map.entries());
  }, [rows]);

  if (byCurrency.length === 0) {
    return <EmptyBlock message="No salary statistics to chart." />;
  }

  return (
    <Stack spacing={3} sx={{ mt: 2 }}>
      {byCurrency.map(([currency, groups]) => (
        <Box key={currency}>
          <Typography variant="subtitle1" component="h4" gutterBottom>
            Average salary ({currency})
          </Typography>
          <Box sx={{ width: '100%', height: 280 }} role="img" aria-label={`Average salary chart in ${currency}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={groups.map((g) => ({ name: g.group, average: g.average }))}
                margin={{ top: 8, right: 16, left: 8, bottom: 48 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} />
                <YAxis
                  tickFormatter={(v: number) =>
                    new Intl.NumberFormat('en-US', {
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    }).format(v)
                  }
                />
                <Tooltip
                  formatter={(value) => [
                    formatSalary(Number(value ?? 0), currency),
                    'Average',
                  ]}
                />
                <Bar dataKey="average" fill="#1976d2" name="Average" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

function StatsSection({
  countries,
}: {
  countries: string[];
}) {
  const [groupBy, setGroupBy] = React.useState<SalaryStatsGroupBy>('department');
  const [country, setCountry] = React.useState('');

  const { data, isLoading, error } = useSalaryStats({
    groupBy,
    country: country || undefined,
  });

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2, flexWrap: 'wrap' }}
      >
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="insights-groupby-label">Group by</InputLabel>
          <Select
            labelId="insights-groupby-label"
            label="Group by"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as SalaryStatsGroupBy)}
            inputProps={{ 'aria-label': 'Group salary stats by' }}
          >
            {GROUP_BY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="insights-stats-country-label">Country filter</InputLabel>
          <Select
            labelId="insights-stats-country-label"
            label="Country filter"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            inputProps={{ 'aria-label': 'Filter salary stats by country' }}
          >
            <MenuItem value="">All countries</MenuItem>
            {countries.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isLoading && <LoadingBlock label="Loading salary statistics…" />}
      {error && <ErrorBlock message={error.message} />}
      {!isLoading && !error && data && data.length === 0 && (
        <EmptyBlock message="No salary statistics for this selection." />
      )}
      {!isLoading && !error && data && data.length > 0 && (
        <>
          <SalaryStatsTable rows={data} />
          <AverageSalaryCharts rows={data} />
        </>
      )}
    </Box>
  );
}

function DistributionSection({ country }: { country: string }) {
  const enabled = Boolean(country);
  const { data, isLoading, error } = useSalaryDistribution(
    { country, bands: 10 },
    enabled
  );

  if (!enabled) {
    return <EmptyBlock message="Select a country to view the salary distribution." />;
  }
  if (isLoading) return <LoadingBlock label="Loading distribution…" />;
  if (error) return <ErrorBlock message={error.message} />;
  if (!data?.bands?.length) {
    return <EmptyBlock message="No distribution data for this country." />;
  }

  const chartData = data.bands.map((band) => ({
    label: `${formatSalary(band.bandStart, band.currency)} – ${formatSalary(band.bandEnd, band.currency)}`,
    count: band.count,
  }));

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {data.country} · {data.currency} · range{' '}
        {formatSalary(data.min, data.currency)} – {formatSalary(data.max, data.currency)}
      </Typography>
      <Box
        sx={{ width: '100%', height: 280 }}
        role="img"
        aria-label={`Salary distribution histogram for ${data.country} in ${data.currency}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 64 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" angle={-30} textAnchor="end" interval={0} height={80} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#2e7d32" name="Employees" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

function ExtremesTable({
  title,
  employees,
  currency,
}: {
  title: string;
  employees: Employee[];
  currency: string;
}) {
  return (
    <Box sx={{ flex: 1, minWidth: 280 }}>
      <Typography variant="subtitle1" component="h4" gutterBottom>
        {title} ({currency})
      </Typography>
      {employees.length === 0 ? (
        <EmptyBlock message="No employees in this list." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label={title}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Job title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="right">Salary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    {emp.firstName} {emp.lastName}
                  </TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell align="right">
                    {formatSalary(emp.salary, emp.currency || currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

function CountryScopedSection({ countries }: { countries: string[] }) {
  const [country, setCountry] = React.useState(countries[0] ?? '');

  React.useEffect(() => {
    if (!country && countries.length > 0) {
      setCountry(countries[0]);
    }
  }, [countries, country]);

  const enabled = Boolean(country);
  const { data, isLoading, error } = useSalaryExtremes(
    { country, limit: 10 },
    enabled
  );

  return (
    <Box>
      <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
        <InputLabel id="insights-country-scoped-label">Country</InputLabel>
        <Select
          labelId="insights-country-scoped-label"
          label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          inputProps={{ 'aria-label': 'Select country for distribution and extremes' }}
        >
          {countries.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        Salary distribution
      </Typography>
      <DistributionSection country={country} />

      <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}>
        Highest and lowest paid
      </Typography>
      {!enabled && <EmptyBlock message="Select a country to view extremes." />}
      {enabled && isLoading && <LoadingBlock label="Loading extremes…" />}
      {enabled && error && <ErrorBlock message={error.message} />}
      {enabled && !isLoading && !error && data && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <ExtremesTable
            title="Highest paid"
            employees={data.highestPaid}
            currency={data.currency}
          />
          <ExtremesTable
            title="Lowest paid"
            employees={data.lowestPaid}
            currency={data.currency}
          />
        </Stack>
      )}
    </Box>
  );
}

export default function InsightsPage() {
  const { data: filterData, isLoading: filtersLoading, error: filtersError } =
    useFilterOptions();
  const countries = filterData?.countries ?? [];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Insights
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        How does the organization pay people?
      </Typography>
      <CurrencyNote />

      <Paper sx={{ p: 2, mb: 3 }} component="section" aria-labelledby="insights-summary-heading">
        <Typography id="insights-summary-heading" variant="h6" component="h2" gutterBottom>
          Organization summary
        </Typography>
        <SummarySection />
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }} component="section" aria-labelledby="insights-stats-heading">
        <Typography id="insights-stats-heading" variant="h6" component="h2" gutterBottom>
          Salary statistics
        </Typography>
        {filtersLoading && <LoadingBlock label="Loading filters…" />}
        {filtersError && <ErrorBlock message={filtersError.message} />}
        {!filtersLoading && !filtersError && <StatsSection countries={countries} />}
      </Paper>

      <Paper sx={{ p: 2 }} component="section" aria-labelledby="insights-country-heading">
        <Typography id="insights-country-heading" variant="h6" component="h2" gutterBottom>
          Country deep dive
        </Typography>
        {filtersLoading && <LoadingBlock label="Loading filters…" />}
        {filtersError && <ErrorBlock message={filtersError.message} />}
        {!filtersLoading && !filtersError && countries.length === 0 && (
          <EmptyBlock message="No countries available." />
        )}
        {!filtersLoading && !filtersError && countries.length > 0 && (
          <CountryScopedSection countries={countries} />
        )}
      </Paper>
    </Box>
  );
}

export { SalaryStatsTable };
