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