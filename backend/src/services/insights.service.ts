import { IInsightsRepository } from '../repositories';
import {
  InsightsSummary,
  SalaryStatsGroup,
  SalaryStatsQueryParams,
  SalaryExtremes,
  ExtremesQueryParams,
  SalaryDistribution,
  DistributionQueryParams,
} from '../types';

export class InsightsService {
  constructor(private readonly insightsRepo: IInsightsRepository) {}

  getSummary(): InsightsSummary {
    return this.insightsRepo.getSummary();
  }

  getSalaryStats(params: SalaryStatsQueryParams): SalaryStatsGroup[] {
    return this.insightsRepo.getSalaryStats(params);
  }

  getExtremes(params: ExtremesQueryParams): SalaryExtremes {
    return this.insightsRepo.getExtremes(params);
  }

  getDistribution(params: DistributionQueryParams): SalaryDistribution {
    return this.insightsRepo.getDistribution(params);
  }
}
