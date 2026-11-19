import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { employeeSchema } from '../types/employee';
import EmployeeForm from '../components/EmployeeForm';
import { FilterOptions } from '../types';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockClear();
  vi.spyOn(globalThis, 'fetch').mockImplementation((mockFetch as unknown) as typeof fetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const filterOptions: FilterOptions = {
  countries: ['United States', 'Germany', 'India'],
  departments: ['Engineering', 'Sales', 'HR'],
  jobTitles: ['Engineer', 'Senior Software Engineer', 'Account Executive'],
};

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

function respond(body: unknown, status = 200) {
  return {
    ok: status === 200,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

async function fillField(id: string, value: string) {
  const input = document.getElementById(id) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
}

describe('employeeSchema validation', () => {
  it('rejects empty required fields', () => {
    const result = employeeSchema.safeParse({
      firstName: '',
      lastName: '',
      email: '',
      jobTitle: '',
      department: '',
      country: '',
      currency: '',
      salary: '',
      hireDate: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = employeeSchema.safeParse({
      firstName: 'Jane', lastName: 'Doe', email: 'not-an-email',
      jobTitle: 'Engineer', department: 'Engineering', country: 'United States',
      currency: 'USD', salary: 120000, hireDate: '2023-05-10',
    });
    expect(result.success).toBe(false);
  });

  it('rejects currency not 3 letters', () => {
    const result = employeeSchema.safeParse({
      firstName: 'Jane', lastName: 'Doe', email: 'jane@acme.corp',
      jobTitle: 'Engineer', department: 'Engineering', country: 'United States',
      currency: 'US_DOLLAR', salary: 120000, hireDate: '2023-05-10',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative salary', () => {
    const result = employeeSchema.safeParse({
      firstName: 'Jane', lastName: 'Doe', email: 'jane@acme.corp',
      jobTitle: 'Engineer', department: 'Engineering', country: 'United States',
      currency: 'USD', salary: -100, hireDate: '2023-05-10',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid employee data', () => {
    const result = employeeSchema.safeParse({
      firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@acme.corp',
      jobTitle: 'Engineer', department: 'Engineering', country: 'United States',
      currency: 'USD', salary: 120000, hireDate: '2023-05-10',
    });
    expect(result.success).toBe(true);
  });

  it('rejects future hire date', () => {
    const result = employeeSchema.safeParse({
      firstName: 'Jane', lastName: 'Doe', email: 'jane@acme.corp',
      jobTitle: 'Engineer', department: 'Engineering', country: 'United States',
      currency: 'USD', salary: 120000, hireDate: '2099-01-01',
    });
    expect(result.success).toBe(false);
  });
});

describe('EmployeeForm UI', () => {
  it('prefills form when editing an existing employee', () => {
    renderWithProviders(
      <EmployeeForm
        open
        onClose={() => {}}
        employee={{
          id: 1,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@acme.corp',
          jobTitle: 'Engineer',
          department: 'Engineering',
          country: 'United States',
          currency: 'USD',
          salary: 120000,
          hireDate: '2023-05-10',
        }}
        filterOptions={filterOptions}
        onSuccess={() => {}}
        onError={() => {}}
      />
    );

    expect(
      (document.getElementById('form-firstName') as HTMLInputElement).value
    ).toBe('Jane');
    expect(
      (document.getElementById('form-lastName') as HTMLInputElement).value
    ).toBe('Doe');
    expect(
      (document.getElementById('form-email') as HTMLInputElement).value
    ).toBe('jane.doe@acme.corp');
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls onSuccess with valid data on submit', async () => {
    const onSuccess = vi.fn();
    mockFetch.mockResolvedValueOnce(respond({ id: 1 }));

    renderWithProviders(
      <EmployeeForm
        open
        onClose={() => {}}
        filterOptions={filterOptions}
        onSuccess={onSuccess}
        onError={() => {}}
      />
    );

    fillField('form-firstName', 'Jane');
    fillField('form-lastName', 'Doe');
    fillField('form-email', 'jane.doe@acme.corp');
    fillField('form-jobTitle', 'Engineer');
    fillField('form-department', 'Engineering');
    fillField('form-country', 'United States');
    fillField('form-currency', 'USD');
    fillField('form-salary', '120000');
    fillField('form-hireDate', '2023-05-10');

    await userEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onError when submission fails', async () => {
    const onError = vi.fn();
    mockFetch.mockRejectedValueOnce(new Error('Email already exists'));

    renderWithProviders(
      <EmployeeForm
        open
        onClose={() => {}}
        filterOptions={filterOptions}
        onSuccess={() => {}}
        onError={onError}
      />
    );

    fillField('form-firstName', 'Jane');
    fillField('form-lastName', 'Doe');
    fillField('form-email', 'jane.doe@acme.corp');
    fillField('form-jobTitle', 'Engineer');
    fillField('form-department', 'Engineering');
    fillField('form-country', 'United States');
    fillField('form-currency', 'USD');
    fillField('form-salary', '120000');
    fillField('form-hireDate', '2023-05-10');

    await userEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Email already exists');
    });
  });

  it('does not call onSuccess when required fields are empty', async () => {
    const onSuccess = vi.fn();
    renderWithProviders(
      <EmployeeForm
        open
        onClose={() => {}}
        filterOptions={filterOptions}
        onSuccess={onSuccess}
        onError={() => {}}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /Create/i }));

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
