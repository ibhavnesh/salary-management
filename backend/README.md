# Salary Management Backend

Backend service for the ACME Salary Management application, built with Node.js, Express, TypeScript, and SQLite via `better-sqlite3`.

## Architecture

The project follows a layered architecture to maintain clear separation of concerns and keep business logic out of HTTP routing:

```
src/
├── types/          # Domain models, database row interfaces, and API types
├── db/             # Database connection lifecycle, PRAGMA configuration, schema initialization
├── repositories/   # SQL query execution and database row mapping
├── services/       # Core business logic and database orchestration
├── controllers/    # HTTP request handling and response formatting
├── routes/         # Express routing definitions
├── seed/           # Deterministic data generation and high-speed batch seeding
├── app.ts          # Express application factory and middleware configuration
└── index.ts        # Server entry point and graceful shutdown handling
```

## Database Schema

Database storage uses SQLite via `better-sqlite3` with WAL mode enabled.

### `employees` Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique employee identifier |
| `first_name` | TEXT | NOT NULL | Employee first name |
| `last_name` | TEXT | NOT NULL | Employee last name |
| `email` | TEXT | NOT NULL UNIQUE | Unique employee email address |
| `job_title` | TEXT | NOT NULL | Job title/role |
| `department` | TEXT | NOT NULL | Department name |
| `country` | TEXT | NOT NULL | Country code or name |
| `currency` | TEXT | NOT NULL CHECK(length(currency) = 3) | 3-letter currency code |
| `salary` | INTEGER | NOT NULL CHECK(salary >= 0) | Whole currency unit annual salary |
| `hire_date` | TEXT | NOT NULL | ISO date string (`YYYY-MM-DD`) |
| `created_at` | TEXT | NOT NULL DEFAULT (datetime('now')) | Creation timestamp |
| `updated_at` | TEXT | NOT NULL DEFAULT (datetime('now')) | Last update timestamp |

### Indexes

- `idx_employees_country` on `country`
- `idx_employees_department` on `department`
- `idx_employees_job_title` on `job_title`
- `idx_employees_salary` on `salary`

## Available Scripts

- `npm run dev`: Start the development server with live reload (`tsx watch src/index.ts`)
- `npm run build`: Compile TypeScript code to `dist/` (`tsc`)
- `npm run start`: Run compiled code (`node dist/index.js`)
- `npm run seed`: Seed the database with 10,000 realistic employees
- `npm test`: Run automated test suites with Vitest using an in-memory SQLite database (`vitest run`)
- `npm run lint`: Run ESLint checks across TypeScript source files

## Database Seeding

The seed script produces 10,000 realistic employee records spread across 8 countries, 8 departments, and realistic roles with salaries scaled by country factor:

- **Run seed:**
  ```bash
  npm run seed
  ```
- **Re-seed / overwrite existing data:**
  ```bash
  npm run seed -- --force
  ```
- **Custom configuration via environment variables:**
  - `SEED`: Random generator seed number for deterministic output (default: `42`).
  - `SEED_COUNT`: Number of employees to generate (default: `10000`).
  - `DATABASE_PATH`: Custom path to target database file.

  Example:
  ```bash
  SEED=123 SEED_COUNT=5000 npm run seed -- --force
  ```

## Environment Variables

- `PORT`: Server port (default: `3001`)
- `DATABASE_PATH`: Path to SQLite database file (default: `./salary.db`)
