# Salary Management Tool: Requirements

## Goal
Give the HR manager of ACME (10,000 employees, multiple countries) one web app to manage salary data and answer questions about how the organization pays people, replacing manual Excel files.

## Primary user
HR Manager.

## Scope & features (v1)
1. Employee directory: paginated, searchable and filterable by country, department and job title; sortable by salary.
2. Create, edit and delete employees with validation (name, job title, department, country, currency, salary, hire date).
3. Insights dashboard: headcount, min/average/median/max salary by country, department and job title; highest and lowest paid; salary distribution bands.
4. Seed script producing 10,000 realistic employees across several countries.

## Deliberately out of scope
- Authentication and roles: one persona (HR Manager) in v1; adds complexity without answering the core question.
- Payroll, tax and benefits calculations: different problem domain.
- Currency conversion with live rates: salaries are shown in local currency; insights are grouped per currency/country to avoid misleading comparisons.
- Approval workflows and audit trail: valuable later, not needed to replace the spreadsheet.

## Key decisions and reasoning
- Server-side pagination, filtering and aggregation (SQL) because 10,000 rows is too heavy to load into the browser.
- Relational database with indexes on country, department and job title for fast filtering and aggregates.
- Thin API layer with a service/repository structure so core logic is unit-testable.

## Success criteria
HR can find any employee in seconds, update salary data, and answer "how do we pay by country/department/role?" without Excel.
