import { Employee } from './employee';

export interface CountryHeadcount {
  country: string;
  currency: string;
  headcount: number;
}

export interface InsightsSummary {
  totalHeadcount: number;
  byCountry: CountryHeadcount[];
  totalDepartments: number;
  totalJobTitles: number;
}

export type SalaryStatsGroupBy = 'country' | 'department' | 'jobTitle';

export interface SalaryStatsGroup {
  group: string;
  currency: string;
  headcount: number;
  min: number;
  average: number;
  median: number;
  max: number;
}

export interface SalaryStatsParams {
  groupBy: SalaryStatsGroupBy;
  country?: string;
  department?: string;
}

export interface SalaryExtremes {
  country: string;
  currency: string;
  highestPaid: Employee[];
  lowestPaid: Employee[];
}

export interface ExtremesParams {
  country: string;
  limit?: number;
  department?: string;
}

export interface SalaryDistributionBand {
  bandStart: number;
  bandEnd: number;
  count: number;
  currency: string;
}

export interface SalaryDistribution {
  country: string;
  currency: string;
  min: number;
  max: number;
  bands: SalaryDistributionBand[];
}

export interface DistributionParams {
  country: string;
  bands?: number;
}
