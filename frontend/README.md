# Salary Management Frontend

Frontend for the ACME Salary Management application, built with Vite + React + TypeScript, MUI (Material UI), TanStack Query, and React Router.

## Stack

| Package | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool / dev server |
| MUI (@mui/material) | Component library |
| TanStack Query | Server-state caching and data fetching |
| React Router | Client-side routing |
| Vitest + React Testing Library | Unit and component tests |
| ESLint + TypeScript ESLint | Linting |
| react-hook-form + zod | Form state and validation |
| @hookform/resolvers | Zod resolver for react-hook-form |
| Recharts | Bar charts and salary histograms |

## Project structure

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── eslint.config.mjs
├── vitest config (in vite.config.ts)
├── .env.example
├── package.json
├── src/
│   ├── main.tsx              # React entry point + QueryClient + Router
│   ├── App.tsx               # Top-level routes
│   ├── vite-env.d.ts         # ImportMeta ambient types
│   ├── setupTests.ts         # Vitest + happy-dom setup
│   ├── types/                # Shared TypeScript types + zod schemas
│   │   ├── employee.ts
│   │   └── insights.ts
│   ├── api/                  # Typed API client (employees + insights)
│   │   └── client.ts
│   ├── hooks/                # TanStack Query hooks + formatting
│   │   ├── useEmployees.ts
│   │   ├── useEmployeeMutations.ts
│   │   ├── useInsights.ts
│   │   └── useFormatSalary.ts
│   ├── components/           # Reusable UI components
│   │   ├── TopBar.tsx
│   │   ├── EmployeeTable.tsx
│   │   └── EmployeeForm.tsx
│   ├── pages/                # Route pages
│   │   ├── Employees.tsx
│   │   └── Insights.tsx
│   └── __tests__/            # Vitest + React Testing Library tests
│       ├── formatSalary.test.ts
│       ├── EmployeesPage.test.tsx
│       ├── EmployeeForm.test.tsx
│       └── InsightsPage.test.tsx
└── dist/                     # Production build output
```

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # optional: override VITE_API_URL
npm run dev            # starts Vite dev server on http://localhost:5173
```

The dev server proxies `/api` requests to `http://localhost:3001` (the backend). Make sure the backend is running.

## Scripts

- `npm run dev`: Start the Vite development server (port 5173).
- `npm run build`: Type-check (`tsc`) and build for production (`vite build` → `dist/`).
- `npm run preview`: Serve the production build locally.
- `npm test`: Run Vitest test suite (`vitest run`).
- `npm run lint`: Run ESLint over `src/`.

## Environment variables

Create a `.env` based on `.env.example`:

```
VITE_API_URL=http://localhost:3001
```

## Rollup on Windows

This Windows machine blocks Rollup's native binary (`@rollup/rollup-win32-x64-msvc`), which Vite and Vitest depend on. `frontend/package.json` includes an `overrides` entry that maps `rollup` to `@rollup/wasm-node`, so Vite and Vitest run without the native binary:

```json
"overrides": {
  "rollup": "npm:@rollup/wasm-node@^4.68.5"
}
```

## Employees page (`/`)

- **List:** Server-side pagination (`page`, `pageSize`, max 100), debounced search box matching first name, last name, email, and job title.
- **Filters:** Dropdowns for country, department, and job title (loaded from `GET /api/employees/filters`). Reset filters button.
- **Sort:** Clickable column headers for salary, hire date, last name, country, department.
- **Create:** "Add employee" button opens a dialog with a validated form (react-hook-form + zod).
- **Edit:** Edit icon per table row opens the same form prefilled with employee data.
- **Delete:** Delete icon per table row opens a confirmation dialog, then calls `DELETE /api/employees/:id`.
- **Salary formatting:** `Intl.NumberFormat` with the employee's currency (e.g. `$140,000`, `€85,000`).
- **States:** Loading, empty, error (with retry), and success/error snackbars after mutations.

### Form validation (zod)

All fields required except where noted:
- `firstName`, `lastName`: non-empty strings
- `email`: valid email format
- `jobTitle`, `department`, `country`: non-empty strings
- `currency`: exactly 3 letters
- `salary`: positive integer
- `hireDate`: valid ISO date (YYYY-MM-DD), not in the future

Server errors (400 validation details, 409 duplicate email) are shown in snackbar.

## Insights page (`/insights`)

Answers “how does the organization pay people?” using `/api/insights/*`. **Currencies are never mixed:** every salary figure is labeled, and average-salary charts are split one chart per currency (or scoped by country filter).

- **Summary cards:** total headcount, countries, departments, job titles; headcount-by-country table with currency.
- **Salary statistics:** `groupBy` (`country` | `department` | `jobTitle`) and optional country filter; table of headcount / min / average / median / max with currency; Recharts bar chart(s) of average salary per currency.
- **Country deep dive:** salary distribution histogram (`GET /api/insights/distribution`) and highest/lowest-paid tables (`GET /api/insights/extremes`) for a selected country.
- **States:** loading, empty, and error per section; responsive layout; accessible labels / `aria-*` on controls and charts.
- **Client:** `insightsApi` in `src/api/client.ts` + `useInsights*` hooks.

## Routes

- `/` → Employees directory page
- `/insights` → Insights dashboard
