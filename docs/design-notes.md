# ACME Salary Management: Design Notes & Architecture

## Architecture Diagram

```mermaid
graph TD
    Client[React Frontend / Browser] -->|HTTP / API Requests| API[Express Router / Controllers]
    API -->|Validation (Zod)| Service[Business Services]
    Service -->|SQL Queries & CTEs| Repo[Repositories]
    Repo -->|Better-SQLite3 WAL| DB[(SQLite Database salary.db)]
```

## Data Model & Schema

The application uses SQLite via `better-sqlite3` in WAL (Write-Ahead Logging) mode with foreign keys enforced.

### `employees` Table
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `first_name`, `last_name`: TEXT NOT NULL
- `email`: TEXT NOT NULL UNIQUE (indexed implicitly or via unique constraint)
- `job_title`: TEXT NOT NULL
- `department`: TEXT NOT NULL
- `country`: TEXT NOT NULL
- `currency`: TEXT NOT NULL CHECK(length(currency) = 3)
- `salary`: INTEGER NOT NULL CHECK(salary >= 0)
- `hire_date`: TEXT NOT NULL (`YYYY-MM-DD`)
- `created_at`, `updated_at`: timestamps

## Indexing Strategy
To ensure low-latency filtering, sorting, and aggregation across 10,000+ records, indexes are created on high-cardinality query columns:
- `idx_employees_country` on `country`
- `idx_employees_department` on `department`
- `idx_employees_job_title` on `job_title`
- `idx_employees_salary` on `salary`

## Pagination & Filtering Approach
- **Server-Side Pagination & Filtering**: Rather than transferring all 10,000 employee records to the client, pagination (`page`, `pageSize`, max 100) and filtering (`search`, `country`, `department`, `jobTitle`, `minSalary`, `maxSalary`) are executed directly in SQLite via parameterized SQL statements.
- **Sorting**: Column sorting is validated against a strict whitelist (`salary`, `hire_date`, `last_name`, `country`, `department`) to prevent SQL injection.

## Currency Handling & Domain Rule
- **Core Domain Rule**: Salaries exist in different currencies (USD, EUR, GBP, CAD, AUD, INR, SGD, BRL). Salaries across different currencies are **never** aggregated or mixed in a single sum or chart axis.
- **Enforcement**: Country-scoped insights endpoints require a country parameter or split groups by currency to preserve accurate economic boundaries.

## Median Computation in SQL
To compute accurate median salaries per group without loading records into application memory, SQLite Common Table Expressions (CTEs) utilize window functions (`ROW_NUMBER()` and `COUNT(*)`):
```sql
WITH ranked AS (
  SELECT
    department as grp,
    currency,
    salary,
    ROW_NUMBER() OVER (PARTITION BY department, currency ORDER BY salary ASC) as row_num,
    COUNT(*) OVER (PARTITION BY department, currency) as total_count
  FROM employees
),
medians AS (
  SELECT
    grp,
    currency,
    ROUND(AVG(salary)) as median
  FROM ranked
  WHERE row_num IN ((total_count + 1) / 2, (total_count + 2) / 2)
  GROUP BY grp, currency
)
...
```

## Trade-offs & Alternatives Considered
1. **SQLite vs PostgreSQL / MySQL**:
   - *Choice*: SQLite (`better-sqlite3`).
   - *Rationale*: Zero external database server setup, lightning-fast in-process execution, perfect for standalone deployment and local development/tests while easily handling 10,000+ rows.
2. **Client-Side vs Server-Side Aggregations**:
   - *Choice*: Server-side SQL aggregates.
   - *Rationale*: Scales efficiently beyond 10k rows and minimizes network payload.
3. **Authentication & Authorization**:
   - *Choice*: Omitted in v1 (single HR Manager persona).
   - *Rationale*: Focuses entirely on replacing the core spreadsheet workflow (managing records & salary insights).
