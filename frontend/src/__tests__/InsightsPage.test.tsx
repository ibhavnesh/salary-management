import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import InsightsPage, { SalaryStatsTable } from '../pages/Insights';
import { SalaryStatsGroup } from '../types';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockClear();
  vi.spyOn(globalThis, 'fetch').mockImplementation((mockFetch as unknown) as typeof fetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const summaryResponse = {
  totalHeadcount: 10000,
  byCountry: [
    { country: 'United States', currency: 'USD', headcount: 1290 },
    { country: 'Germany', currency: 'EUR', headcount: 800 },
  ],
  totalDepartments: 8,
  totalJobTitles: 42,
};

const filtersResponse = {
  countries: ['Germany', 'United States'],
  departments: ['Engineering', 'Finance'],
  jobTitles: ['Engineer', 'Analyst'],
};

const salaryStatsResponse: SalaryStatsGroup[] = [
  {
    group: 'Engineering',
    currency: 'USD',
    headcount: 400,
    min: 70000,
    average: 120000,
    median: 115000,
    max: 200000,
  },
  {
    group: 'Engineering',
    currency: 'EUR',
    headcount: 160,
    min: 33392,
    average: 92000,
    median: 88000,
    max: 200107,
  },
];

const extremesResponse = {
  country: 'United States',
  currency: 'USD',
  highestPaid: [
    {
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@acme.corp',
      jobTitle: 'VP Engineering',
      department: 'Engineering',
      country: 'United States',
      currency: 'USD',
      salary: 250000,
      hireDate: '2019-01-01',
    },
  ],
  lowestPaid: [
    {
      id: 2,
      firstName: 'Sam',
      lastName: 'Lee',
      email: 'sam.lee@acme.corp',
      jobTitle: 'Intern',
      department: 'Engineering',
      country: 'United States',
      currency: 'USD',
      salary: 45000,
      hireDate: '2024-06-01',
    },
  ],
};

const distributionResponse = {
  country: 'United States',
  currency: 'USD',
  min: 45000,
  max: 250000,
  bands: [
    { bandStart: 45000, bandEnd: 85000, count: 200, currency: 'USD' },
    { bandStart: 85000, bandEnd: 125000, count: 500, currency: 'USD' },
  ],
};

function respond(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

function mockAllApis() {
  mockFetch.mockImplementation((url: string) => {
    const u = String(url);
    if (u.includes('/api/insights/summary')) return Promise.resolve(respond(summaryResponse));
    if (u.includes('/api/insights/salary-stats')) return Promise.resolve(respond(salaryStatsResponse));
    if (u.includes('/api/insights/extremes')) return Promise.resolve(respond(extremesResponse));
    if (u.includes('/api/insights/distribution')) return Promise.resolve(respond(distributionResponse));
    if (u.includes('/filters')) return Promise.resolve(respond(filtersResponse));
    return Promise.resolve(respond({}));
  });
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

describe('SalaryStatsTable', () => {
  it('renders stats rows from mocked data and always shows currency', () => {
    render(<SalaryStatsTable rows={salaryStatsResponse} />);

    expect(screen.getByTestId('salary-stats-table')).toBeInTheDocument();
    expect(screen.getAllByText('Engineering').length).toBe(2);
    expect(screen.getAllByText('USD').length).toBeGreaterThan(0);
    expect(screen.getAllByText('EUR').length).toBeGreaterThan(0);
    expect(screen.getByText('$120,000')).toBeInTheDocument();
    expect(screen.getByText('€92,000')).toBeInTheDocument();
  });
});

describe('InsightsPage', () => {
  it('renders summary and salary stats with currency labels', async () => {
    mockAllApis();
    renderWithProviders(<InsightsPage />);

    await waitFor(() => {
      expect(screen.getByText('10,000')).toBeInTheDocument();
    });

    expect(screen.getByText(/never mixed across currencies/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('salary-stats-table')).toBeInTheDocument();
    });

    expect(screen.getAllByText('USD').length).toBeGreaterThan(0);
    expect(screen.getAllByText('EUR').length).toBeGreaterThan(0);
    expect(screen.getByText('$120,000')).toBeInTheDocument();
  });

  it('shows loading state while fetching summary', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<InsightsPage />);
    expect(screen.getByText(/Loading summary/i)).toBeInTheDocument();
  });

  it('shows error state when summary request fails', async () => {
    mockFetch.mockImplementation((url: string) => {
      const u = String(url);
      if (u.includes('/api/insights/summary')) {
        return Promise.reject(new Error('Insights unavailable'));
      }
      if (u.includes('/api/insights/salary-stats')) return Promise.resolve(respond(salaryStatsResponse));
      if (u.includes('/api/insights/extremes')) return Promise.resolve(respond(extremesResponse));
      if (u.includes('/api/insights/distribution')) return Promise.resolve(respond(distributionResponse));
      if (u.includes('/filters')) return Promise.resolve(respond(filtersResponse));
      return Promise.resolve(respond({}));
    });

    renderWithProviders(<InsightsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Insights unavailable/)).toBeInTheDocument();
    });
  });
});
