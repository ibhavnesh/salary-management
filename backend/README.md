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
- `npm test`: Run automated test suites with Vitest using an in-memory SQLite database (`vitest run`)
- `npm run lint`: Run ESLint checks across TypeScript source files

## Environment Variables

- `PORT`: Server port (default: `3001`)
- `DATABASE_PATH`: Path to SQLite database file (default: `./salary.db`)
