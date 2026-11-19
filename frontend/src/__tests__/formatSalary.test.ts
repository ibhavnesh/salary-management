import { describe, it, expect } from 'vitest';
import { formatSalary } from '../hooks/useFormatSalary';

describe('formatSalary', () => {
  it('formats USD salary without decimals', () => {
    expect(formatSalary(120000, 'USD')).toBe('$120,000');
    expect(formatSalary(95000, 'USD')).toBe('$95,000');
  });

  it('formats EUR salary with euro symbol', () => {
    const formatted = formatSalary(85000, 'EUR');
    expect(formatted).toContain('85,000');
    expect(formatted).toMatch(/€|EUR/);
  });

  it('formats INR salary', () => {
    const formatted = formatSalary(1200000, 'INR');
    expect(formatted).toContain('₹');
    expect(formatted).toContain('1,200,000');
  });

  it('handles zero salary', () => {
    expect(formatSalary(0, 'USD')).toBe('$0');
  });
});
