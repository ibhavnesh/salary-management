# AI Prompts Log

This file records the prompts used with AI tools while building this project, and what I accepted, changed or rejected afterwards.

## Tooling
- Editor: Cursor with Kilo Code extension
- Models: [model name via OmniRoute]

## Prompts
(Each entry: step, prompt, what I accepted or changed.)

### Step 2: Backend scaffold
Prompt: scaffold backend with Express, TypeScript, SQLite (better-sqlite3), layered structure, schema with indexes, /health, Vitest.
Result: accepted the layered structure, DB schema and tests. Verified with npm test (6 passing) and GET /health.
Notes: an Application Control policy on my Windows machine blocked Rollup's native binary, so I used Rollup's WASM build locally (inside node_modules only). I also noticed SQLite WAL files had been committed by mistake and removed them from tracking.

### Step 3: Seed script
Prompt: seed script for 10,000 employees with faker, deterministic seed, 8 countries with local currencies, realistic departments/titles/salaries, pure generator function, transactional insert, idempotent with --force, tests.
Result: accepted. Verified: 15 tests passing, DB has 10,000 employees across 8 countries, currencies match countries.

### Step 4: Employee REST API
Prompt: employee CRUD API with server-side pagination, search, filters, sorting, zod validation, consistent errors (400/404/409), parameterized SQL with sort whitelist, filters endpoint, Supertest tests.
Result: accepted. 22 new API tests, 37 tests passing in total. Verified manually in the browser: pagination (total 10000), country filter with salary sort, search, filters endpoint, 404 for a missing id.
Notes: port 3001 was in use by an old dev server, so I stopped it and restarted.

### Step 5: Insights API
Prompt: insights endpoints (summary, salary-stats by country/department/jobTitle, extremes, distribution) with a rule to never mix currencies, median via SQL, zod validation, tests, README docs.
Result: accepted. 10 new insights tests; 47 tests passing in total; build and lint are clean. Verified manually in the browser.
Notes: the Kilo task hung for about 20 minutes on the final step, so I cancelled it after confirming tests passed.