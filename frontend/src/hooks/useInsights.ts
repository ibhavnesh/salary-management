import { useQuery } from '@tanstack/react-query';
import { insightsApi } from '../api/client';
import {
  InsightsSummary,
  SalaryStatsGroup,
  SalaryStatsParams,
  SalaryExtremes,
  ExtremesParams,
  SalaryDistribution,
  DistributionParams,
} from '../types';

export function useInsightsSummary() {
  return useQuery({
    queryKey: ['insights', 'summary'],
    queryFn: insightsApi.summary,
  }) as ReturnType<typeof useQuery<InsightsSummary, Error>>;
}

export function useSalaryStats(params: SalaryStatsParams, enabled = true) {
  return useQuery({
    queryKey: ['insights', 'salary-stats', params],
    queryFn: () => insightsApi.salaryStats(params),
    enabled,
  }) as ReturnType<typeof useQuery<SalaryStatsGroup[], Error>>;
}

export function useSalaryExtremes(params: ExtremesParams, enabled = true) {
  return useQuery({
    queryKey: ['insights', 'extremes', params],
    queryFn: () => insightsApi.extremes(params),
    enabled,
  }) as ReturnType<typeof useQuery<SalaryExtremes, Error>>;
}

export function useSalaryDistribution(params: DistributionParams, enabled = true) {
  return useQuery({
    queryKey: ['insights', 'distribution', params],
    queryFn: () => insightsApi.distribution(params),
    enabled,
  }) as ReturnType<typeof useQuery<SalaryDistribution, Error>>;
}
