import { describe, it, expect } from 'vitest';
import { formatXLM, truncateAddress, isValidAmount, timeUntil, calculateReward, bpsToPercent } from '../utils/helpers';

describe('formatXLM', () => {
  it('formats stroops to XLM with 2 decimals', () => {
    expect(formatXLM(10_000_000)).toBe('1.00');
    expect(formatXLM(50_000_000)).toBe('5.00');
    expect(formatXLM(12_345_678)).toBe('1.23');
  });

  it('formats zero correctly', () => {
    expect(formatXLM(0)).toBe('0.00');
  });

  it('formats large amounts', () => {
    expect(formatXLM(1_000_000_000_000)).toBe('100000.00');
  });

  it('formats fractional amounts', () => {
    expect(formatXLM(1)).toBe('0.00');
    expect(formatXLM(100_000)).toBe('0.01');
  });
});

describe('truncateAddress', () => {
  it('truncates a long address to default 6 chars', () => {
    const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890123456789012345';
    const result = truncateAddress(addr);
    expect(result).toBe('GABCDE...012345');
    expect(result.length).toBeLessThan(addr.length);
  });

  it('truncates with custom char count', () => {
    const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890123456789012345';
    const result = truncateAddress(addr, 4);
    expect(result).toBe('GABC...2345');
  });

  it('returns short addresses as-is', () => {
    expect(truncateAddress('ABCDEF', 6)).toBe('ABCDEF');
    expect(truncateAddress('AB', 4)).toBe('AB');
  });
});

describe('isValidAmount', () => {
  it('accepts positive numbers', () => {
    expect(isValidAmount('1')).toBe(true);
    expect(isValidAmount('0.5')).toBe(true);
    expect(isValidAmount('100.25')).toBe(true);
  });

  it('rejects zero and negative numbers', () => {
    expect(isValidAmount('0')).toBe(false);
    expect(isValidAmount('-1')).toBe(false);
    expect(isValidAmount('-0.5')).toBe(false);
  });

  it('rejects invalid strings', () => {
    expect(isValidAmount('')).toBe(false);
    expect(isValidAmount('abc')).toBe(false);
    expect(isValidAmount('12abc')).toBe(false);
    expect(isValidAmount('Infinity')).toBe(false);
  });
});

describe('timeUntil', () => {
  it('returns "Unlocked" for past timestamps', () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    expect(timeUntil(past)).toBe('Unlocked');
  });

  it('returns "Unlocked" for zero', () => {
    expect(timeUntil(0)).toBe('Unlocked');
  });

  it('formats days and hours for future timestamps', () => {
    const futureSeconds = Math.floor(Date.now() / 1000) + 90000; // ~1 day + 1 hour
    const result = timeUntil(futureSeconds);
    expect(result).toMatch(/^\d+d \d+h$/);
  });

  it('formats hours and minutes when under 1 day', () => {
    const futureSeconds = Math.floor(Date.now() / 1000) + 7200; // 2 hours
    const result = timeUntil(futureSeconds);
    expect(result).toMatch(/^\d+h \d+m$/);
  });

  it('formats minutes when under 1 hour', () => {
    const futureSeconds = Math.floor(Date.now() / 1000) + 600; // 10 minutes
    const result = timeUntil(futureSeconds);
    expect(result).toMatch(/^\d+m$/);
  });
});

describe('calculateReward (Green Belt)', () => {
  it('calculates 5% reward at 500 bps', () => {
    // 100 XLM in stroops = 1_000_000_000
    expect(calculateReward(1_000_000_000, 500)).toBe(50_000_000); // 5 SVT
  });

  it('calculates 10% reward at 1000 bps', () => {
    expect(calculateReward(1_000_000_000, 1000)).toBe(100_000_000);
  });

  it('returns 0 for zero amount', () => {
    expect(calculateReward(0, 500)).toBe(0);
  });

  it('returns 0 for zero rate', () => {
    expect(calculateReward(1_000_000_000, 0)).toBe(0);
  });

  it('returns 0 for negative values', () => {
    expect(calculateReward(-100, 500)).toBe(0);
    expect(calculateReward(100, -500)).toBe(0);
  });

  it('handles small amounts without floating point issues', () => {
    // 1 XLM = 10_000_000 stroops at 500 bps = 500_000 stroops (0.05 XLM)
    expect(calculateReward(10_000_000, 500)).toBe(500_000);
  });
});

describe('bpsToPercent', () => {
  it('converts 500 bps to 5.0%', () => {
    expect(bpsToPercent(500)).toBe('5.0');
  });

  it('converts 100 bps to 1.0%', () => {
    expect(bpsToPercent(100)).toBe('1.0');
  });

  it('converts 250 bps to 2.5%', () => {
    expect(bpsToPercent(250)).toBe('2.5');
  });

  it('converts 10000 bps to 100.0%', () => {
    expect(bpsToPercent(10000)).toBe('100.0');
  });

  it('converts 0 bps to 0.0%', () => {
    expect(bpsToPercent(0)).toBe('0.0');
  });
});
