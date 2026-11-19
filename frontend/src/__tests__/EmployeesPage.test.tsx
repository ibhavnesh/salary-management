import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import EmployeesPage from '../pages/Employees';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockClear();
  vi.spyOn(globalThis, 'fetch').mockImplementation((mockFetch as unknown) as typeof fetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const pageResponse = {
  data: [
    {
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@acme.corp',
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
      country: 'United States',
      currency: 'USD',
      salary: 140000,
      hireDate: '2023-05-10',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      firstName: 'Hans',
      lastName: 'Mueller',
      email: 'hans.mueller@acme.corp',
      jobTitle: 'Engineer',
      department: 'Engineering',
      country: 'Germany',
      currency: 'EUR',
      salary: 85000,
      hireDate: '2022-03-01',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ],
  page: 1,
  pageSize: 25,
  total: 2,
  totalPages: 1,
};

const filtersResponse = {
  countries: ['Germany', 'United States'],
  departments: ['Engineering'],
  jobTitles: ['Engineer', 'Senior Software Engineer'],
};

function respond(body: unknown, status = 200) {
  return {
    ok: status === 200,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

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

describe('EmployeesPage', () => {
  it('renders employee rows from mocked API data', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (String(url).includes('/filters')) {
        return Promise.resolve(respond(filtersResponse));
      }
      return Promise.resolve(respond(pageResponse));
    });

    renderWithProviders(<EmployeesPage />);

    // Table renders even during loading (with skeletons)
    expect(screen.getByRole('table')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Hans Mueller/)).toBeInTheDocument();
      expect(screen.getByText('$140,000')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<EmployeesPage />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('shows error state with retry button on failure', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (String(url).includes('/filters')) {
        return Promise.resolve(respond(filtersResponse));
      }
      return Promise.reject(new Error('Server error'));
    });

    renderWithProviders(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Retry/i)).toBeInTheDocument();
  });

  it('shows empty state when no employees match', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (String(url).includes('/filters')) {
        return Promise.resolve(respond(filtersResponse));
      }
      return Promise.resolve(
        respond({ ...pageResponse, data: [], total: 0, totalPages: 0 })
      );
    });

    renderWithProviders(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText(/No employees found/)).toBeInTheDocument();
    });
  });

  it('deletes an employee through confirmation dialog', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (String(url).includes('/filters')) {
        return Promise.resolve(respond(filtersResponse));
      }
      if (String(url).includes('/api/employees/1')) {
        return Promise.resolve(respond(undefined, 200));
      }
      return Promise.resolve(respond(pageResponse));
    });

    renderWithProviders(<EmployeesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    });

    // Click delete icon for Jane Doe (first row)
    const deleteButtons = screen.getAllByTestId('delete-employee-button');
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]);

    // Confirm delete in dialog
    await waitFor(() => {
      expect(screen.getByText(/Are you sure/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText(/Employee deleted successfully/)).toBeInTheDocument();
    });
  });
});
