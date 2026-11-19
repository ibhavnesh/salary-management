# ACME Salary Management System

A production-ready salary management web application designed for HR managers to manage personnel records and gain deep compensation insights across a global organization of 10,000+ employees, replacing legacy spreadsheets.

---

## Overview

ACME Salary Management provides a unified interface for HR professionals to:
- **Manage Employee Records**: Paginate, search across names/emails/titles, filter by country/department/job title, sort by salary or hire date, and perform full CRUD operations with robust validation.
- **Analyze Compensation Insights**: Explore headcount breakdowns, salary statistics (min, average, median, max), salary distribution histograms, and highest/lowest paid personnel—with strict currency isolation.

---

## Key Features

- **Employee Directory (`/`)**:
  - Server-side pagination, debounced global search, and multi-field filtering.
  - Interactive table with sticky headers, department color chips, and compact row design.
  - Add/Edit employee dialog with Zod validation and delete confirmation.
- **Insights Dashboard (`/insights`)**:
  - Organized in clean tabs: Overview, Salary Stats, and Country Deep Dive.
  - Recharts visualizations for headcount and salary distributions.
  - **Strict Currency Integrity**: Currencies are never mixed across calculations, charts, or table axes.
- **Robust Backend API**:
  - Layered architecture (Controllers, Services, Repositories).
  - SQLite storage with WAL mode and indexes on high-cardinality fields.
  - Deterministic 10,000-employee seed script.

---

## Tech Stack

| Tier | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Material UI (MUI v6), TanStack Query, React Router, Recharts, React Hook Form, Zod v4 |
| **Backend** | Node.js, Express, TypeScript, SQLite (`better-sqlite3`), Zod v3 |
| **Testing** | Vitest, React Testing Library, Supertest |

---

## Architecture

```
salary-management/
├── backend/
│   ├── src/
│   │   ├── controllers/   # HTTP request parsing & response formatting
│   │   ├── services/      # Core business logic & orchestration
│   │   ├── repositories/  # SQL queries & database mapping
│   │   ├── routes/        # Express routers (/health, /api/employees, /api/insights)
│   │   ├── db/            # SQLite connection lifecycle & schema initialization
│   │   └── seed/          # Deterministic data generation (10k employees)
│   └── tests/             # Vitest + Supertest automated test suite
├── frontend/
│   ├── src/
│   │   ├── api/           # Typed API client
│   │   ├── components/    # Reusable UI components (Table, Form, TopBar)
│   │   ├── hooks/         # TanStack Query hooks & formatters
│   │   ├── pages/         # Employees directory & Insights dashboard
│   │   └── __tests__/     # Vitest + RTL component tests
└── docs/                  # Design notes & performance benchmarks
```

---

## How to Run Locally

### Prerequisites
- Node.js (v20+ recommended, tested on v24)
- npm

### 1. Backend Setup & Seeding
```bash
cd backend
npm install
npm run seed        # Seeds 10,000 employees into salary.db
npm run dev         # Starts dev server on port 3001
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev         # Starts Vite dev server on port 5173 (proxies /api to localhost:3001)
```

---

## Available Scripts

### Backend (`/backend`)
- `npm run dev`: Start dev server with live reload (`tsx watch src/index.ts`)
- `npm run build`: Compile TypeScript (`tsc`)
- `npm run start`: Run production build (`node dist/index.js`)
- `npm run seed`: Seed database with 10,000 employees (`tsx src/seed/seed.ts`)
- `npm test`: Run backend Vitest tests (`vitest run`)
- `npm run lint`: Run ESLint (`eslint src`)

### Frontend (`/frontend`)
- `npm run dev`: Start Vite dev server
- `npm run build`: Type-check and build for production (`tsc && vite build`)
- `npm test`: Run Vitest component tests (`vitest run`)
- `npm run lint`: Run ESLint (`eslint src`)

---

## Testing

- **Backend**: 47 automated tests covering employee CRUD, filters, insights, schema validation, and data generation.
- **Frontend**: 23 automated tests covering salary formatting, directory page, employee form validation, and insights dashboard.
- Run tests in either directory using `npm test`.

---

## API Summary

- **`GET /health`**: Health check and database connectivity status.
- **`GET /api/employees`**: Paginated, filtered, searched, and sorted employee list.
- **`GET /api/employees/filters`**: Distinct countries, departments, and job titles.
- **`GET /api/employees/:id`**: Retrieve single employee.
- **`POST /api/employees`**: Create employee record.
- **`PUT /api/employees/:id`**: Update employee record.
- **`DELETE /api/employees/:id`**: Remove employee record.
- **`GET /api/insights/summary`**: Total headcount, country breakdown, department/job title counts.
- **`GET /api/insights/salary-stats`**: Min, average, median, max salary per group (grouped by country, department, or job title).
- **`GET /api/insights/extremes`**: Highest and lowest paid employees in a country.
- **`GET /api/insights/distribution`**: Equal-width salary histogram bands for a country.

---

## Key Design Decisions

1. **Server-Side Filtering & Aggregations**: 10,000 rows are processed in SQLite via parameterized SQL queries and CTEs rather than loading datasets into browser memory.
2. **Strict Currency Isolation**: Salaries are stored in local currencies. Insights queries and visualizations never cross-aggregate different currencies to prevent misleading financial metrics.
3. **Layered Backend Architecture**: Clear separation between Express routing, business services, and SQL repositories ensures high testability and maintainability.

---

## What Was Deliberately Left Out (v1 Scope)

- **Authentication & Roles**: Single HR Manager persona in v1; adds complexity without replacing the core spreadsheet need.
- **Payroll & Tax Calculations**: Out of scope for personnel salary management and compensation analysis.
- **Live Currency Conversion**: Salaries are displayed and analyzed in their native currencies; cross-currency conversion introduces exchange-rate volatility not required for internal pay equity analysis.

---

## Performance Notes

- Main API endpoints respond in under **25ms** (median) against the 10,000-row dataset thanks to SQLite indexes on `country`, `department`, `job_title`, and `salary`.
- See [docs/performance.md](./docs/performance.md) for full reproduction steps and metrics.

---

## How AI Was Used

AI (powered by Kilo and Gemini) was used interactively to assist with architecture planning, writing layered services/repositories, implementing SQL CTE window functions for median calculation, constructing React components with Material UI v6 and Recharts, and writing comprehensive test suites. All code was reviewed, verified, and tested against the repository requirements.
