import { faker } from '@faker-js/faker';

export interface GeneratedEmployee {
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  hire_date: string;
}

export interface CountryConfig {
  country: string;
  currency: string;
  factor: number;
}

export interface JobTitleConfig {
  title: string;
  minBaseSalary: number;
  maxBaseSalary: number;
}

export interface DepartmentConfig {
  name: string;
  jobTitles: JobTitleConfig[];
}

export const COUNTRIES: readonly CountryConfig[] = [
  { country: 'United States', currency: 'USD', factor: 1.0 },
  { country: 'United Kingdom', currency: 'GBP', factor: 0.78 },
  { country: 'Germany', currency: 'EUR', factor: 0.85 },
  { country: 'Canada', currency: 'CAD', factor: 1.25 },
  { country: 'Australia', currency: 'AUD', factor: 1.35 },
  { country: 'India', currency: 'INR', factor: 22.0 },
  { country: 'Singapore', currency: 'SGD', factor: 1.2 },
  { country: 'Brazil', currency: 'BRL', factor: 2.8 },
] as const;

export const DEPARTMENTS: readonly DepartmentConfig[] = [
  {
    name: 'Engineering',
    jobTitles: [
      { title: 'Junior Software Engineer', minBaseSalary: 60000, maxBaseSalary: 80000 },
      { title: 'Software Engineer', minBaseSalary: 85000, maxBaseSalary: 120000 },
      { title: 'Senior Software Engineer', minBaseSalary: 125000, maxBaseSalary: 165000 },
      { title: 'Lead Engineer', minBaseSalary: 150000, maxBaseSalary: 190000 },
      { title: 'Engineering Manager', minBaseSalary: 160000, maxBaseSalary: 210000 },
      { title: 'QA Engineer', minBaseSalary: 65000, maxBaseSalary: 95000 },
      { title: 'DevOps Engineer', minBaseSalary: 95000, maxBaseSalary: 140000 },
    ],
  },
  {
    name: 'Sales',
    jobTitles: [
      { title: 'Sales Development Representative', minBaseSalary: 45000, maxBaseSalary: 65000 },
      { title: 'Account Executive', minBaseSalary: 70000, maxBaseSalary: 110000 },
      { title: 'Senior Account Executive', minBaseSalary: 110000, maxBaseSalary: 150000 },
      { title: 'Sales Manager', minBaseSalary: 130000, maxBaseSalary: 175000 },
      { title: 'Sales Director', minBaseSalary: 170000, maxBaseSalary: 220000 },
    ],
  },
  {
    name: 'Marketing',
    jobTitles: [
      { title: 'Marketing Coordinator', minBaseSalary: 45000, maxBaseSalary: 65000 },
      { title: 'Content Strategist', minBaseSalary: 60000, maxBaseSalary: 90000 },
      { title: 'Digital Marketing Specialist', minBaseSalary: 65000, maxBaseSalary: 95000 },
      { title: 'Marketing Manager', minBaseSalary: 95000, maxBaseSalary: 135000 },
      { title: 'Head of Marketing', minBaseSalary: 140000, maxBaseSalary: 190000 },
    ],
  },
  {
    name: 'HR',
    jobTitles: [
      { title: 'HR Assistant', minBaseSalary: 40000, maxBaseSalary: 55000 },
      { title: 'HR Specialist', minBaseSalary: 55000, maxBaseSalary: 75000 },
      { title: 'Talent Acquisition Partner', minBaseSalary: 65000, maxBaseSalary: 95000 },
      { title: 'HR Business Partner', minBaseSalary: 85000, maxBaseSalary: 120000 },
      { title: 'Head of HR', minBaseSalary: 130000, maxBaseSalary: 180000 },
    ],
  },
  {
    name: 'Finance',
    jobTitles: [
      { title: 'Staff Accountant', minBaseSalary: 55000, maxBaseSalary: 75000 },
      { title: 'Financial Analyst', minBaseSalary: 60000, maxBaseSalary: 85000 },
      { title: 'Senior Financial Analyst', minBaseSalary: 85000, maxBaseSalary: 115000 },
      { title: 'Accounting Manager', minBaseSalary: 100000, maxBaseSalary: 135000 },
      { title: 'Finance Director', minBaseSalary: 150000, maxBaseSalary: 200000 },
    ],
  },
  {
    name: 'Operations',
    jobTitles: [
      { title: 'Operations Coordinator', minBaseSalary: 45000, maxBaseSalary: 65000 },
      { title: 'Operations Specialist', minBaseSalary: 60000, maxBaseSalary: 85000 },
      { title: 'Supply Chain Analyst', minBaseSalary: 65000, maxBaseSalary: 90000 },
      { title: 'Operations Manager', minBaseSalary: 90000, maxBaseSalary: 130000 },
      { title: 'Director of Operations', minBaseSalary: 140000, maxBaseSalary: 190000 },
    ],
  },
  {
    name: 'Product',
    jobTitles: [
      { title: 'Associate Product Manager', minBaseSalary: 65000, maxBaseSalary: 85000 },
      { title: 'Product Manager', minBaseSalary: 95000, maxBaseSalary: 135000 },
      { title: 'Senior Product Manager', minBaseSalary: 135000, maxBaseSalary: 175000 },
      { title: 'Product Designer', minBaseSalary: 80000, maxBaseSalary: 120000 },
      { title: 'VP of Product', minBaseSalary: 180000, maxBaseSalary: 240000 },
    ],
  },
  {
    name: 'Support',
    jobTitles: [
      { title: 'Customer Support Specialist', minBaseSalary: 40000, maxBaseSalary: 55000 },
      { title: 'Technical Support Engineer', minBaseSalary: 55000, maxBaseSalary: 80000 },
      { title: 'Support Team Lead', minBaseSalary: 70000, maxBaseSalary: 95000 },
      { title: 'Customer Success Manager', minBaseSalary: 75000, maxBaseSalary: 105000 },
      { title: 'Head of Support', minBaseSalary: 110000, maxBaseSalary: 150000 },
    ],
  },
] as const;

export interface GenerateOptions {
  seed?: number;
  referenceDate?: Date;
}

export function generateEmployees(
  count: number,
  options: GenerateOptions = {}
): GeneratedEmployee[] {
  const seed = options.seed ?? (process.env.SEED ? parseInt(process.env.SEED, 10) : 42);
  faker.seed(seed);

  const refDate = options.referenceDate ?? new Date('2026-11-18T00:00:00.000Z');
  const tenYearsAgo = new Date(refDate);
  tenYearsAgo.setFullYear(refDate.getFullYear() - 10);

  const employees: GeneratedEmployee[] = new Array(count);
  const seenEmails = new Set<string>();

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // Ensure unique email addresses
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let email = `${cleanFirst}.${cleanLast}@acme.corp`;
    let suffix = 1;
    while (seenEmails.has(email)) {
      email = `${cleanFirst}.${cleanLast}${suffix}@acme.corp`;
      suffix++;
    }
    seenEmails.add(email);

    // Pick department and job title
    const department = faker.helpers.arrayElement(DEPARTMENTS);
    const job = faker.helpers.arrayElement(department.jobTitles);

    // Pick country and currency
    const countryInfo = faker.helpers.arrayElement(COUNTRIES);

    // Calculate realistic salary scaled by country factor
    const baseSalary = faker.number.int({
      min: job.minBaseSalary,
      max: job.maxBaseSalary,
    });
    // Add ±5% individual variance and scale by country
    const varianceFactor = faker.number.float({ min: 0.95, max: 1.05, fractionDigits: 4 });
    const salary = Math.max(1, Math.round(baseSalary * countryInfo.factor * varianceFactor));

    // Hire date within the last 10 years
    const hireDateObj = faker.date.between({ from: tenYearsAgo, to: refDate });
    const hireDate = hireDateObj.toISOString().slice(0, 10);

    employees[i] = {
      first_name: firstName,
      last_name: lastName,
      email,
      job_title: job.title,
      department: department.name,
      country: countryInfo.country,
      currency: countryInfo.currency,
      salary,
      hire_date: hireDate,
    };
  }

  return employees;
}
