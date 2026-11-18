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

## API Documentation

All responses are formatted in JSON. Validation errors return `400` with `{ error: { message, details } }`. Missing records return `404`, and unique constraint violations (e.g. duplicate email) return `409`.

### 1. Health Check

- **`GET /health`**
  - **Response:** `200 OK`
  ```json
  {
    "status": "ok",
    "timestamp": "2026-11-18T10:00:00.000Z",
    "uptime": 12.34,
    "database": "connected"
  }
  ```

### 2. Employee Endpoints (`/api/employees`)

#### `GET /api/employees`
Paginated, searchable, filterable, and sortable employee list.

- **Query Parameters:**
  - `page` (integer, default `1`): Current page number.
  - `pageSize` (integer, default `25`, max `100`): Results per page.
  - `search` (string, optional): Matches across first name, last name, email, or job title.
  - `country` (string, optional): Exact country name.
  - `department` (string, optional): Exact department name.
  - `jobTitle` (string, optional): Exact job title.
  - `minSalary` (integer, optional): Lower salary bound.
  - `maxSalary` (integer, optional): Upper salary bound.
  - `sortBy` (string, whitelist: `salary`, `hire_date`, `last_name`, `country`, `department`): Sort column.
  - `sortOrder` (`asc` | `desc`, default `asc`): Sort direction.

- **Example Request:**
  `GET /api/employees?page=1&pageSize=10&country=Germany&department=Engineering&minSalary=70000&sortBy=salary&sortOrder=desc`

- **Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": 102,
        "firstName": "Hans",
        "lastName": "Mueller",
        "email": "hans.mueller@acme.corp",
        "jobTitle": "Senior Software Engineer",
        "department": "Engineering",
        "country": "Germany",
        "currency": "EUR",
        "salary": 95000,
        "hireDate": "2022-03-01",
        "createdAt": "2026-11-18 10:00:00",
        "updatedAt": "2026-11-18 10:00:00"
      }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
  ```

#### `GET /api/employees/filters`
Returns distinct lists of countries, departments, and job titles for UI filter dropdowns.

- **Response:** `200 OK`
  ```json
  {
    "countries": ["Australia", "Brazil", "Canada", "Germany", "India", "Singapore", "United Kingdom", "United States"],
    "departments": ["Engineering", "Finance", "HR", "Marketing", "Operations", "Product", "Sales", "Support"],
    "jobTitles": ["Account Executive", "Engineering Manager", "Software Engineer"]
  }
  ```

#### `GET /api/employees/:id`
Retrieves a single employee by integer ID.

- **Response:** `200 OK` or `404 Not Found`
  ```json
  {
    "id": 1,
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@acme.corp",
    "jobTitle": "Lead Engineer",
    "department": "Engineering",
    "country": "United States",
    "currency": "USD",
    "salary": 165000,
    "hireDate": "2021-08-15",
    "createdAt": "2026-11-18 10:00:00",
    "updatedAt": "2026-11-18 10:00:00"
  }
  ```

#### `POST /api/employees`
Creates a new employee record.

- **Body (JSON):**
  ```json
  {
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice.smith@acme.corp",
    "jobTitle": "Senior Software Engineer",
    "department": "Engineering",
    "country": "United States",
    "currency": "USD",
    "salary": 140000,
    "hireDate": "2023-05-10"
  }
  ```
- **Response:** `201 Created` with created employee record.
- **Errors:** `400 Bad Request` (validation failed), `409 Conflict` (duplicate email).

#### `PUT /api/employees/:id`
Updates an existing employee record.

- **Body (JSON):** All employee fields (or updated fields).
- **Response:** `200 OK` with updated employee record.
- **Errors:** `400 Bad Request`, `404 Not Found`, `409 Conflict`.

#### `DELETE /api/employees/:id`
Removes an employee record.

- **Response:** `200 OK`
  ```json
  {
    "message": "Employee deleted successfully"
  }
  ```
- **Errors:** `404 Not Found`.

## Environment Variables

- `PORT`: Server port (default: `3001`)
- `DATABASE_PATH`: Path to SQLite database file (default: `./salary.db`)
