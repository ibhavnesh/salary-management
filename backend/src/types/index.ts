export * from './employee';
export * from './insights';
export * from './schemas';
export * from './errors';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected';
}
