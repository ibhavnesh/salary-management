import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app';
import { initDb } from '../src/db';
import { seedDatabase } from '../src/seed/seed';
import { Express } from 'express';
import { Employee, PaginatedEmployeesResponse, EmployeeFilterOptions } from '../src/types';

describe('Employee REST API (/api/employees)', () => {
  let db: Database.Database;
  let app: Express;

  beforeEach(() => {
    db = initDb({ inMemory: true });
    // Seed with small deterministic dataset (30 employees)
    seedDatabase(db, { count: 30, seed: 12345, force: true });
    app = createApp(db);
  });

  afterEach(() => {
    if (db && db.open) {
      db.close();
    }
  });

  describe('GET /api/employees/filters', () => {
    it('returns distinct sorted filter options for countries, departments and job titles', async () => {
      const response = await request(app).get('/api/employees/filters');

      expect(response.status).toBe(200);
      const filters = response.body as EmployeeFilterOptions;

      expect(Array.isArray(filters.countries)).toBe(true);
      expect(Array.isArray(filters.departments)).toBe(true);
      expect(Array.isArray(filters.jobTitles)).toBe(true);

      expect(filters.countries.length).toBeGreaterThan(0);
      expect(filters.departments.length).toBeGreaterThan(0);
      expect(filters.jobTitles.length).toBeGreaterThan(0);

      // Verify they are sorted alphabetically
      expect(filters.countries).toEqual([...filters.countries].sort());
      expect(filters.departments).toEqual([...filters.departments].sort());
      expect(filters.jobTitles).toEqual([...filters.jobTitles].sort());
    });
  });

  describe('GET /api/employees', () => {
    it('returns default paginated employees (page 1, pageSize 25)', async () => {
      const response = await request(app).get('/api/employees');

      expect(response.status).toBe(200);
      const body = response.body as PaginatedEmployeesResponse;

      expect(body.page).toBe(1);
      expect(body.pageSize).toBe(25);
      expect(body.total).toBe(30);
      expect(body.totalPages).toBe(2);
      expect(body.data).toHaveLength(25);

      const firstEmp = body.data[0];
      expect(firstEmp).toHaveProperty('id');
      expect(firstEmp).toHaveProperty('firstName');
      expect(firstEmp).toHaveProperty('lastName');
      expect(firstEmp).toHaveProperty('email');
      expect(firstEmp).toHaveProperty('jobTitle');
      expect(firstEmp).toHaveProperty('department');
      expect(firstEmp).toHaveProperty('country');
      expect(firstEmp).toHaveProperty('currency');
      expect(firstEmp).toHaveProperty('salary');
      expect(firstEmp).toHaveProperty('hireDate');
      expect(firstEmp).toHaveProperty('createdAt');
      expect(firstEmp).toHaveProperty('updatedAt');
    });

    it('respects page and pageSize query parameters', async () => {
      const response = await request(app).get('/api/employees?page=2&pageSize=10');

      expect(response.status).toBe(200);
      const body = response.body as PaginatedEmployeesResponse;

      expect(body.page).toBe(2);
      expect(body.pageSize).toBe(10);
      expect(body.total).toBe(30);
      expect(body.totalPages).toBe(3);
      expect(body.data).toHaveLength(10);
    });

    it('filters employees by search query across name, email and job title', async () => {
      // Find one employee from page 1 to search for
      const listRes = await request(app).get('/api/employees?pageSize=1');
      const targetEmp = (listRes.body as PaginatedEmployeesResponse).data[0];

      // Search by first name
      const searchRes = await request(app).get(`/api/employees?search=${targetEmp.firstName}`);
      expect(searchRes.status).toBe(200);
      const found = (searchRes.body as PaginatedEmployeesResponse).data;
      expect(found.some((e) => e.id === targetEmp.id)).toBe(true);

      // Search by email prefix
      const emailPrefix = targetEmp.email.split('@')[0];
      const emailRes = await request(app).get(`/api/employees?search=${emailPrefix}`);
      expect(emailRes.status).toBe(200);
      expect((emailRes.body as PaginatedEmployeesResponse).data.some((e) => e.id === targetEmp.id)).toBe(true);
    });

    it('filters by country', async () => {
      const filtersRes = await request(app).get('/api/employees/filters');
      const testCountry = (filtersRes.body as EmployeeFilterOptions).countries[0];

      const response = await request(app).get(`/api/employees?country=${encodeURIComponent(testCountry)}`);
      expect(response.status).toBe(200);
      const body = response.body as PaginatedEmployeesResponse;

      expect(body.total).toBeGreaterThan(0);
      for (const emp of body.data) {
        expect(emp.country).toBe(testCountry);
      }
    });

    it('filters by department', async () => {
      const filtersRes = await request(app).get('/api/employees/filters');
      const testDept = (filtersRes.body as EmployeeFilterOptions).departments[0];

      const response = await request(app).get(`/api/employees?department=${encodeURIComponent(testDept)}`);
      expect(response.status).toBe(200);
      const body = response.body as PaginatedEmployeesResponse;

      expect(body.total).toBeGreaterThan(0);
      for (const emp of body.data) {
        expect(emp.department).toBe(testDept);
      }
    });

    it('filters by jobTitle', async () => {
      const filtersRes = await request(app).get('/api/employees/filters');
      const testJob = (filtersRes.body as EmployeeFilterOptions).jobTitles[0];

      const response = await request(app).get(`/api/employees?jobTitle=${encodeURIComponent(testJob)}`);
      expect(response.status).toBe(200);
      const body = response.body as PaginatedEmployeesResponse;

      expect(body.total).toBeGreaterThan(0);
      for (const emp of body.data) {
        expect(emp.jobTitle).toBe(testJob);
      }
    });

    it('filters by minSalary and maxSalary', async () => {
      const minSalary = 60000;
      const maxSalary = 120000;

      const response = await request(app).get(`/api/employees?minSalary=${minSalary}&maxSalary=${maxSalary}&pageSize=50`);
      expect(response.status).toBe(200);
      const body = response.body as PaginatedEmployeesResponse;

      for (const emp of body.data) {
        expect(emp.salary).toBeGreaterThanOrEqual(minSalary);
        expect(emp.salary).toBeLessThanOrEqual(maxSalary);
      }
    });

    it('sorts employees by salary ascending and descending', async () => {
      const ascRes = await request(app).get('/api/employees?sortBy=salary&sortOrder=asc&pageSize=30');
      expect(ascRes.status).toBe(200);
      const ascData = (ascRes.body as PaginatedEmployeesResponse).data;
      for (let i = 1; i < ascData.length; i++) {
        expect(ascData[i].salary).toBeGreaterThanOrEqual(ascData[i - 1].salary);
      }

      const descRes = await request(app).get('/api/employees?sortBy=salary&sortOrder=desc&pageSize=30');
      expect(descRes.status).toBe(200);
      const descData = (descRes.body as PaginatedEmployeesResponse).data;
      for (let i = 1; i < descData.length; i++) {
        expect(descData[i].salary).toBeLessThanOrEqual(descData[i - 1].salary);
      }
    });

    it('sorts employees by hire_date and last_name', async () => {
      const dateRes = await request(app).get('/api/employees?sortBy=hire_date&sortOrder=asc&pageSize=30');
      expect(dateRes.status).toBe(200);
      const dateData = (dateRes.body as PaginatedEmployeesResponse).data;
      for (let i = 1; i < dateData.length; i++) {
        expect(dateData[i].hireDate >= dateData[i - 1].hireDate).toBe(true);
      }

      const nameRes = await request(app).get('/api/employees?sortBy=last_name&sortOrder=desc&pageSize=30');
      expect(nameRes.status).toBe(200);
      const nameData = (nameRes.body as PaginatedEmployeesResponse).data;
      for (let i = 1; i < nameData.length; i++) {
        expect(nameData[i].lastName.localeCompare(nameData[i - 1].lastName) <= 0).toBe(true);
      }
    });

    it('returns 400 for invalid query parameters', async () => {
      const res = await request(app).get('/api/employees?page=0');
      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error).toHaveProperty('details');
    });
  });

  describe('GET /api/employees/:id', () => {
    it('returns employee details by ID', async () => {
      const listRes = await request(app).get('/api/employees?pageSize=1');
      const sample = (listRes.body as PaginatedEmployeesResponse).data[0];

      const res = await request(app).get(`/api/employees/${sample.id}`);
      expect(res.status).toBe(200);
      const emp = res.body as Employee;
      expect(emp.id).toBe(sample.id);
      expect(emp.email).toBe(sample.email);
    });

    it('returns 404 for non-existent employee ID', async () => {
      const res = await request(app).get('/api/employees/999999');
      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain('not found');
    });

    it('returns 400 for invalid employee ID format', async () => {
      const res = await request(app).get('/api/employees/abc');
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Invalid employee ID');
    });
  });

  describe('POST /api/employees', () => {
    it('creates a new employee with valid payload', async () => {
      const payload = {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@acme.corp',
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        country: 'United States',
        currency: 'USD',
        salary: 135000,
        hireDate: '2023-04-15',
      };

      const res = await request(app).post('/api/employees').send(payload);
      expect(res.status).toBe(201);
      const created = res.body as Employee;

      expect(created.id).toBeDefined();
      expect(created.firstName).toBe('Alice');
      expect(created.lastName).toBe('Smith');
      expect(created.email).toBe('alice.smith@acme.corp');
      expect(created.salary).toBe(135000);
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();

      // Verify persisted in database
      const fetchRes = await request(app).get(`/api/employees/${created.id}`);
      expect(fetchRes.status).toBe(200);
      expect(fetchRes.body.email).toBe('alice.smith@acme.corp');
    });

    it('returns 409 when creating an employee with a duplicate email', async () => {
      const listRes = await request(app).get('/api/employees?pageSize=1');
      const existingEmail = (listRes.body as PaginatedEmployeesResponse).data[0].email;

      const payload = {
        firstName: 'Duplicate',
        lastName: 'User',
        email: existingEmail,
        jobTitle: 'Accountant',
        department: 'Finance',
        country: 'United States',
        currency: 'USD',
        salary: 75000,
        hireDate: '2022-01-01',
      };

      const res = await request(app).post('/api/employees').send(payload);
      expect(res.status).toBe(409);
      expect(res.body.error.message).toContain('already exists');
    });

    it('returns 400 with details when required fields are missing or invalid', async () => {
      const invalidPayloads = [
        {
          // Missing firstName and lastName
          email: 'test@acme.corp',
          jobTitle: 'Engineer',
          department: 'Engineering',
          country: 'USA',
          currency: 'USD',
          salary: 80000,
          hireDate: '2022-01-01',
        },
        {
          // Invalid email
          firstName: 'Bob',
          lastName: 'Jones',
          email: 'not-an-email',
          jobTitle: 'Engineer',
          department: 'Engineering',
          country: 'USA',
          currency: 'USD',
          salary: 80000,
          hireDate: '2022-01-01',
        },
        {
          // Currency not 3 letters
          firstName: 'Bob',
          lastName: 'Jones',
          email: 'bob.currency@acme.corp',
          jobTitle: 'Engineer',
          department: 'Engineering',
          country: 'USA',
          currency: 'US_DOLLAR',
          salary: 80000,
          hireDate: '2022-01-01',
        },
        {
          // Salary negative or 0
          firstName: 'Bob',
          lastName: 'Jones',
          email: 'bob.salary@acme.corp',
          jobTitle: 'Engineer',
          department: 'Engineering',
          country: 'USA',
          currency: 'USD',
          salary: -1000,
          hireDate: '2022-01-01',
        },
        {
          // Hire date in the future
          firstName: 'Bob',
          lastName: 'Jones',
          email: 'bob.future@acme.corp',
          jobTitle: 'Engineer',
          department: 'Engineering',
          country: 'USA',
          currency: 'USD',
          salary: 80000,
          hireDate: '2099-01-01',
        },
      ];

      for (const payload of invalidPayloads) {
        const res = await request(app).post('/api/employees').send(payload);
        expect(res.status).toBe(400);
        expect(res.body.error).toHaveProperty('message');
        expect(res.body.error).toHaveProperty('details');
        expect(Array.isArray(res.body.error.details)).toBe(true);
      }
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('updates an existing employee', async () => {
      const listRes = await request(app).get('/api/employees?pageSize=1');
      const target = (listRes.body as PaginatedEmployeesResponse).data[0];

      const updatePayload = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: target.email, // keep same email
        jobTitle: 'Staff Engineer',
        department: 'Engineering',
        country: target.country,
        currency: target.currency,
        salary: target.salary + 15000,
        hireDate: target.hireDate,
      };

      const res = await request(app).put(`/api/employees/${target.id}`).send(updatePayload);
      expect(res.status).toBe(200);
      const updated = res.body as Employee;

      expect(updated.id).toBe(target.id);
      expect(updated.firstName).toBe('UpdatedFirst');
      expect(updated.lastName).toBe('UpdatedLast');
      expect(updated.salary).toBe(target.salary + 15000);
      expect(updated.jobTitle).toBe('Staff Engineer');
    });

    it('returns 404 when updating non-existent employee', async () => {
      const updatePayload = {
        firstName: 'Unknown',
        lastName: 'User',
        email: 'unknown.user@acme.corp',
        jobTitle: 'Analyst',
        department: 'Operations',
        country: 'Canada',
        currency: 'CAD',
        salary: 60000,
        hireDate: '2021-05-10',
      };

      const res = await request(app).put('/api/employees/999999').send(updatePayload);
      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain('not found');
    });

    it('returns 409 when updating email to one that belongs to another employee', async () => {
      const listRes = await request(app).get('/api/employees?pageSize=2');
      const [emp1, emp2] = (listRes.body as PaginatedEmployeesResponse).data;

      // Try to give emp2 the email of emp1
      const updatePayload = {
        firstName: emp2.firstName,
        lastName: emp2.lastName,
        email: emp1.email,
        jobTitle: emp2.jobTitle,
        department: emp2.department,
        country: emp2.country,
        currency: emp2.currency,
        salary: emp2.salary,
        hireDate: emp2.hireDate,
      };

      const res = await request(app).put(`/api/employees/${emp2.id}`).send(updatePayload);
      expect(res.status).toBe(409);
      expect(res.body.error.message).toContain('already exists');
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('deletes an existing employee', async () => {
      const listRes = await request(app).get('/api/employees?pageSize=1');
      const target = (listRes.body as PaginatedEmployeesResponse).data[0];

      const delRes = await request(app).delete(`/api/employees/${target.id}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.message).toContain('deleted successfully');

      // Verify employee no longer exists
      const fetchRes = await request(app).get(`/api/employees/${target.id}`);
      expect(fetchRes.status).toBe(404);
    });

    it('returns 404 when deleting a non-existent employee', async () => {
      const res = await request(app).delete('/api/employees/999999');
      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain('not found');
    });
  });
});
