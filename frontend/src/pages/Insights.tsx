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
  Tab,
  Tabs,
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
  SalaryStatsGroup,
  SalaryStatsGroupBy,
} from '../types';

const GROUP_BY_OPTIONS: { value: SalaryStatsGroupBy; label: string }[] = [
  { value: 'department', label: 'Department' },
  { value: 'jobTitle', label: 'Job title' },
  { value: 'country', label: 'Country' },
];

function CurrencyNote() {
  return (
    <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }} role="note">
      Currencies are never mixed across currencies. Each table row, chart, and figure is strictly labeled with its currency.
    </Alert>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}
      role="status"
      aria-label={label}
    >
      <CircularProgress size={28} thickness={4} />
      <Typography sx={{ ml: 2, color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
    </Box>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <Alert severity="error" sx={{ my: 2, borderRadius: '8px' }}>
      {message}
    </Alert>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
      {message}
    </Typography>
  );
}

// Tab 1: Overview
function OverviewTab() {
  const { data, isLoading, error } = useInsightsSummary();

  if (isLoading) return <LoadingBlock label="Loading summary..." />;
  if (error) return <ErrorBlock message={error.message} />;
  if (!data) return <EmptyBlock message="No summary data available." />;

  const cards = [
    { label: 'Total Headcount', value: data.totalHeadcount.toLocaleString() },
    { label: 'Countries', value: String(data.byCountry.length) },
    { label: 'Departments', value: String(data.totalDepartments) },
    { label: 'Job Titles', value: String(data.totalJobTitles) },
  ];

  const chartData = data.byCountry.map((c) => ({
    name: c.country,
    headcount: c.headcount,
    currency: c.currency,
  }));

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ p: 1, borderColor: '#E5E7EB', borderRadius: '10px' }} aria-label={card.label}>
              <CardContent sx={{ p: '16px !important' }}>
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, mb: 0.5 }}>
                  {card.label}
                </Typography>
                <Typography variant="h4" component="p" sx={{ fontWeight: 700, color: '#111827' }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: '10px' }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
              Headcount by Country
            </Typography>
            <Box sx={{ width: '100%', height: 320 }} role="img" aria-label="Headcount by country bar chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#6B7280" fontSize={12} width={110} tickLine={false} />
                  <Tooltip
                    formatter={(val) => [Number(val ?? 0).toLocaleString(), 'Headcount']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 8 }}
                  />
                  <Bar dataKey="headcount" fill="#2563EB" radius={[0, 4, 4, 0]} name="Headcount" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, border: '1px solid #E5E7EB', borderRadius: '10px', height: '100%' }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
              Country Breakdown
            </Typography>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                maxHeight: 300,
                overflowX: 'auto',
                width: '100%',
                WebkitOverflowScrolling: 'touch',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            >
              <Table size="small" stickyHeader aria-label="Headcount by country table" sx={{ minWidth: { xs: 400, md: 'auto' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Country</TableCell>
                    <TableCell>Currency</TableCell>
                    <TableCell align="right">Headcount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.byCountry.map((row) => (
                    <TableRow key={row.country} hover>
                      <TableCell sx={{ fontWeight: 500, whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{row.country}</TableCell>
                      <TableCell sx={{ color: '#6B7280', whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{row.currency}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{row.headcount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// Tab 2: Salary Stats
function SalaryStatsTab({ countries }: { countries: string[] }) {
  const [groupBy, setGroupBy] = React.useState<SalaryStatsGroupBy>('department');
  const [country, setCountry] = React.useState(countries[0] ?? '');

  React.useEffect(() => {
    if (!country && countries.length > 0) {
      setCountry(countries[0]);
    }
  }, [countries, country]);

  const { data, isLoading, error } = useSalaryStats({
    groupBy,
    country: country || undefined,
  }, Boolean(country));

  const currency = data?.[0]?.currency || 'USD';

  return (
    <Box>
      <Paper sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', borderRadius: '10px' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 220, flex: { sm: 1 } }}>
            <InputLabel id="stats-country-label">Country (Required for Currency Isolation)</InputLabel>
            <Select
              labelId="stats-country-label"
              label="Country (Required for Currency Isolation)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {countries.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180, flex: { sm: 1 } }}>
            <InputLabel id="stats-groupby-label">Group By</InputLabel>
            <Select
              labelId="stats-groupby-label"
              label="Group By"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as SalaryStatsGroupBy)}
            >
              {GROUP_BY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {!country && <EmptyBlock message="Please select a country to view salary statistics." />}
      {country && isLoading && <LoadingBlock label="Loading salary statistics..." />}
      {country && error && <ErrorBlock message={error.message} />}
      {country && !isLoading && !error && (!data || data.length === 0) && (
        <EmptyBlock message="No statistics found for this country selection." />
      )}
      {country && !isLoading && !error && data && data.length > 0 && (
        <Stack spacing={4}>
          {/* Average Salary Chart for selected country */}
          <Paper sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: '10px' }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
              Average Salary by {groupBy === 'department' ? 'Department' : groupBy === 'jobTitle' ? 'Job Title' : 'Country'} ({currency})
            </Typography>
            <Box sx={{ width: '100%', height: 320 }} role="img" aria-label={`Average salary chart in ${currency}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.map((g) => ({ name: g.group, average: g.average }))}
                  margin={{ top: 12, right: 24, left: 24, bottom: 64 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={70}
                    stroke="#6B7280"
                    fontSize={11}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(v: number) =>
                      new Intl.NumberFormat('en-US', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(v)
                    }
                  />
                  <Tooltip
                    formatter={(val) => [formatSalary(Number(val ?? 0), currency), 'Average Salary']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 8 }}
                  />
                  <Bar dataKey="average" fill="#2563EB" radius={[4, 4, 0, 0]} name="Average" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Stats Table */}
          <SalaryStatsTable rows={data} />
        </Stack>
      )}
    </Box>
  );
}

// Tab 3: Country Deep Dive
function CountryDeepDiveTab({ countries }: { countries: string[] }) {
  const [country, setCountry] = React.useState(countries[0] ?? '');

  React.useEffect(() => {
    if (!country && countries.length > 0) {
      setCountry(countries[0]);
    }
  }, [countries, country]);

  const enabled = Boolean(country);
  const distQuery = useSalaryDistribution({ country, bands: 10 }, enabled);
  const extremesQuery = useSalaryExtremes({ country, limit: 10 }, enabled);

  return (
    <Box>
      <Paper sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', borderRadius: '10px' }}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel id="deepdive-country-label">Country</InputLabel>
          <Select
            labelId="deepdive-country-label"
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {countries.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {!enabled && <EmptyBlock message="Please select a country." />}
      {enabled && (distQuery.isLoading || extremesQuery.isLoading) && (
        <LoadingBlock label="Loading country analysis..." />
      )}
      {enabled && (distQuery.error || extremesQuery.error) && (
        <ErrorBlock message={distQuery.error?.message || extremesQuery.error?.message || 'Error loading data'} />
      )}

      {enabled && !distQuery.isLoading && !extremesQuery.isLoading && distQuery.data && extremesQuery.data && (
        <Stack spacing={4}>
          {/* Salary Distribution Histogram */}
          <Paper sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: '10px' }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
              Salary Distribution ({distQuery.data.currency})
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Range: {formatSalary(distQuery.data.min, distQuery.data.currency)} – {formatSalary(distQuery.data.max, distQuery.data.currency)}
            </Typography>
            <Box
              sx={{ width: '100%', height: 300 }}
              role="img"
              aria-label={`Salary distribution histogram for ${distQuery.data.country} in ${distQuery.data.currency}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distQuery.data.bands.map((b) => ({
                    label: `${formatSalary(b.bandStart, b.currency)} – ${formatSalary(b.bandEnd, b.currency)}`,
                    count: b.count,
                  }))}
                  margin={{ top: 12, right: 24, left: 12, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="label"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={75}
                    stroke="#6B7280"
                    fontSize={11}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Highest & Lowest Paid Tables */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', height: '100%' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Highest Paid ({extremesQuery.data.currency})
                  </Typography>
                </Box>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    maxHeight: 350,
                    overflowX: 'auto',
                    width: '100%',
                    WebkitOverflowScrolling: 'touch',
                    border: 'none',
                    borderRadius: 0,
                  }}
                >
                  <Table size="small" stickyHeader aria-label="Highest paid employees" sx={{ minWidth: { xs: 520, md: 'auto' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Job Title</TableCell>
                        <TableCell align="right">Salary</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {extremesQuery.data.highestPaid.map((emp) => (
                        <TableRow key={emp.id} hover>
                          <TableCell sx={{ fontWeight: 500, whiteSpace: { xs: 'nowrap', md: 'normal' } }}>
                            {emp.firstName} {emp.lastName}
                          </TableCell>
                          <TableCell sx={{ color: '#4B5563', whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{emp.jobTitle}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: { xs: 'nowrap', md: 'normal' } }}>
                            {formatSalary(emp.salary, extremesQuery.data.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', height: '100%' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    Lowest Paid ({extremesQuery.data.currency})
                  </Typography>
                </Box>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    maxHeight: 350,
                    overflowX: 'auto',
                    width: '100%',
                    WebkitOverflowScrolling: 'touch',
                    border: 'none',
                    borderRadius: 0,
                  }}
                >
                  <Table size="small" stickyHeader aria-label="Lowest paid employees" sx={{ minWidth: { xs: 520, md: 'auto' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Job Title</TableCell>
                        <TableCell align="right">Salary</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {extremesQuery.data.lowestPaid.map((emp) => (
                        <TableRow key={emp.id} hover>
                          <TableCell sx={{ fontWeight: 500, whiteSpace: { xs: 'nowrap', md: 'normal' } }}>
                            {emp.firstName} {emp.lastName}
                          </TableCell>
                          <TableCell sx={{ color: '#4B5563', whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{emp.jobTitle}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: { xs: 'nowrap', md: 'normal' } }}>
                            {formatSalary(emp.salary, extremesQuery.data.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )}
    </Box>
  );
}

export default function InsightsPage() {
  const [tab, setTab] = React.useState(0);
  const { data: filterData, isLoading: filtersLoading, error: filtersError } =
    useFilterOptions();
  const countries = filterData?.countries ?? [];

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: '#111827', mb: 0.5, letterSpacing: '-0.025em' }}>
        Insights
      </Typography>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
        Organization compensation analytics and distribution overview
      </Typography>

      <CurrencyNote />

      <Paper sx={{ mb: 3, border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2,
            borderBottom: '1px solid #E5E7EB',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 48 },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Salary Stats" />
          <Tab label="Country Deep Dive" />
        </Tabs>
      </Paper>

      {filtersLoading && <LoadingBlock label="Loading filter options..." />}
      {filtersError && <ErrorBlock message={filtersError.message} />}

      {!filtersLoading && !filtersError && (
        <Box>
          {tab === 0 && <OverviewTab />}
          {tab === 1 && <SalaryStatsTab countries={countries} />}
          {tab === 2 && <CountryDeepDiveTab countries={countries} />}
        </Box>
      )}
    </Box>
  );
}

export function SalaryStatsTable({ rows }: { rows: SalaryStatsGroup[] }) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      data-testid="salary-stats-table"
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        overflowX: 'auto',
        width: '100%',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Table size="small" stickyHeader aria-label="Salary statistics table" sx={{ minWidth: { xs: 640, md: 'auto' } }}>
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
            <TableRow key={`${row.group}-${row.currency}`} hover>
              <TableCell sx={{ fontWeight: 500, whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{row.group}</TableCell>
              <TableCell sx={{ color: '#6B7280', whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{row.currency}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{row.headcount.toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{formatSalary(row.min, row.currency)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{formatSalary(row.average, row.currency)}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{formatSalary(row.median, row.currency)}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: { xs: 'nowrap', md: 'normal' } }}>{formatSalary(row.max, row.currency)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
