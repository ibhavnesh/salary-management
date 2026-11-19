# ACME Salary Management: Performance Benchmark

This document records the benchmark results of the backend API endpoints against the 10,000-employee dataset (`salary.db`).

## Test Environment
- **Platform**: Windows / Node.js v24.20.0
- **Database**: SQLite with WAL mode, 10,000 seeded employee records across 8 countries.
- **Methodology**: Measured over 20 iterations after warmup requests using `Invoke-WebRequest` and `System.Diagnostics.Stopwatch`.

## Benchmark Results (10,000 Rows)

| Endpoint | Min (ms) | Median (ms) | Max (ms) | Response Size |
|---|---|---|---|---|
| `GET /health` | 11.74 | 15.08 | 17.65 | 97 B |
| `GET /api/employees` (page 1, pageSize 25) | 20.30 | 21.92 | 35.94 | 7,384 B |
| `GET /api/employees` (search + filter + sort) | 22.01 | 22.87 | 29.64 | 7,358 B |
| `GET /api/employees/filters` | 15.04 | 16.44 | 20.55 | 1,144 B |
| `GET /api/employees/:id` | 13.09 | 14.20 | 15.76 | 317 B |
| `GET /api/insights/summary` | 20.42 | 21.27 | 32.16 | 540 B |
| `GET /api/insights/salary-stats?groupBy=country` | 41.02 | 49.81 | 65.94 | 910 B |
| `GET /api/insights/salary-stats?groupBy=department&country=Germany` | 18.23 | 18.96 | 21.97 | 881 B |
| `GET /api/insights/salary-stats?groupBy=jobTitle` | 65.81 | 69.92 | 72.34 | 41,005 B |
| `GET /api/insights/extremes?country=United States` | 20.23 | 21.92 | 23.62 | 5,871 B |
| `GET /api/insights/distribution?country=India` | 14.64 | 15.70 | 16.85 | 758 B |

## How to Reproduce
1. Ensure dependencies are installed and database is seeded:
   ```bash
   cd backend
   npm install
   npm run seed -- --force
   ```
2. Build and start the server:
   ```bash
   npm run build
   npm run start
   ```
3. Run performance timing script or test suite:
   ```bash
   npm test
   ```
