import { describe, it, expect } from 'vitest';
import { computeCheckin, getCheckinPoints } from '../services/checkin';
import { EmissionBreakdown } from '../types';
import { CHECKIN_POINTS_AWARD } from '../constants';

const SAMPLE_BASELINE: EmissionBreakdown = {
  transport: 5000,
  flights: 2000,
  energy: 3000,
  food: 2500,
  waste: 1500,
  total: 14000,
};

describe('computeCheckin', () => {
  it('computes reduced emissions from baseline', () => {
    const result = computeCheckin(SAMPLE_BASELINE, { transport: 10, energy: 10, food: 10, waste: 10 }, 'user1');
    expect(result.transportEmissions).toBe(4500); // 5000 * 0.9
    expect(result.energyEmissions).toBe(2700); // 3000 * 0.9
    expect(result.foodEmissions).toBe(2250); // 2500 * 0.9
    expect(result.wasteEmissions).toBe(1350); // 1500 * 0.9
  });

  it('computes total as sum of categories', () => {
    const result = computeCheckin(SAMPLE_BASELINE, { transport: 20, energy: 0, food: 0, waste: 0 }, 'user1');
    expect(result.totalNetEmissions).toBe(result.transportEmissions + result.energyEmissions + result.foodEmissions + result.wasteEmissions);
  });

  it('returns baseline for zero reductions', () => {
    const result = computeCheckin(SAMPLE_BASELINE, { transport: 0, energy: 0, food: 0, waste: 0 }, 'user1');
    expect(result.transportEmissions).toBe(SAMPLE_BASELINE.transport);
    expect(result.totalNetEmissions).toBe(SAMPLE_BASELINE.transport + SAMPLE_BASELINE.energy + SAMPLE_BASELINE.food + SAMPLE_BASELINE.waste);
  });

  it('assigns garden level based on reduction', () => {
    const result = computeCheckin(SAMPLE_BASELINE, { transport: 50, energy: 50, food: 50, waste: 50 }, 'user1');
    expect(result.gardenStateLevel).toBeGreaterThanOrEqual(1);
    expect(result.gardenStateLevel).toBeLessThanOrEqual(5);
  });

  it('preserves userId', () => {
    const result = computeCheckin(SAMPLE_BASELINE, { transport: 0, energy: 0, food: 0, waste: 0 }, 'test-user-42');
    expect(result.userId).toBe('test-user-42');
  });

  it('handles maximum reductions (50%)', () => {
    const result = computeCheckin(SAMPLE_BASELINE, { transport: 50, energy: 50, food: 50, waste: 50 }, 'user1');
    expect(result.transportEmissions).toBe(2500);
    expect(result.gardenStateLevel).toBe(5);
  });
});

describe('getCheckinPoints', () => {
  it('returns the configured award amount', () => {
    expect(getCheckinPoints()).toBe(CHECKIN_POINTS_AWARD);
  });
});
