import { describe, it, expect } from 'vitest';
import { calculateEmissions, getWorstCategory, getReductionPct, getGardenLevel } from '../services/emissions';
import { QuizAnswers, LocaleConfig } from '../types';

const US_LOCALE: LocaleConfig = {
  distanceUnit: 'miles',
  currencySymbol: '$',
  currencyCode: 'USD',
  emissionSource: 'EPA',
  distFactor: 0.411,
  electricityFactor: 0.85,
  gasFactor: 0.55,
};

const GERMANY_LOCALE: LocaleConfig = {
  distanceUnit: 'km',
  currencySymbol: '€',
  currencyCode: 'EUR',
  emissionSource: 'DEFRA',
  distFactor: 0.175,
  electricityFactor: 0.17,
  gasFactor: 0.14,
};

const BASE_ANSWERS: QuizAnswers = {
  q1_transport_mode: 0,
  q2_weekly_distance: 50,
  q3_public_transit_hours: 0,
  q4_rideshare_frequency: 0,
  q5_short_flights: 0,
  q6_long_flights: 0,
  q7_electricity_bill: 100,
  q8_heating_fuel: 0,
  q9_renewable_pct: 0,
  q10_diet: 0,
  q11_local_food: 0,
  q12_food_waste: 0,
  q13_garbage_bags: 1,
  q14_recycling: 0,
  q15_shopping: 0,
};

describe('calculateEmissions', () => {
  it('returns positive total for typical US lifestyle', () => {
    const result = calculateEmissions(BASE_ANSWERS, US_LOCALE);
    expect(result.total).toBeGreaterThan(0);
    expect(result.transport).toBeGreaterThan(0);
    expect(result.energy).toBeGreaterThan(0);
    expect(result.food).toBeGreaterThan(0);
    expect(result.waste).toBeGreaterThan(0);
  });

  it('sums categories to match total', () => {
    const result = calculateEmissions(BASE_ANSWERS, US_LOCALE);
    expect(result.transport + result.flights + result.energy + result.food + result.waste).toBeCloseTo(result.total, 0);
  });

  it('returns zero transport for walking/biking (mode 5)', () => {
    const answers = { ...BASE_ANSWERS, q1_transport_mode: 5, q2_weekly_distance: 0, q4_rideshare_frequency: 0 };
    const result = calculateEmissions(answers, US_LOCALE);
    expect(result.transport).toBe(0);
  });

  it('returns higher transport for SUV vs EV', () => {
    const suv = calculateEmissions({ ...BASE_ANSWERS, q1_transport_mode: 0 }, US_LOCALE);
    const ev = calculateEmissions({ ...BASE_ANSWERS, q1_transport_mode: 3 }, US_LOCALE);
    expect(suv.transport).toBeGreaterThan(ev.transport);
  });

  it('reduces transport with public transit hours', () => {
    const noTransit = calculateEmissions(BASE_ANSWERS, US_LOCALE);
    const withTransit = calculateEmissions({ ...BASE_ANSWERS, q3_public_transit_hours: 10 }, US_LOCALE);
    expect(withTransit.transport).toBeLessThan(noTransit.transport);
  });

  it('calculates flights in miles for US locale', () => {
    const answers = { ...BASE_ANSWERS, q5_short_flights: 5, q6_long_flights: 2 };
    const result = calculateEmissions(answers, US_LOCALE);
    expect(result.flights).toBeGreaterThan(0);
  });

  it('calculates flights in km for Germany locale', () => {
    const answers = { ...BASE_ANSWERS, q5_short_flights: 5, q6_long_flights: 2 };
    const result = calculateEmissions(answers, GERMANY_LOCALE);
    expect(result.flights).toBeGreaterThan(0);
  });

  it('reduces energy with 100% renewable', () => {
    const noRenewable = calculateEmissions(BASE_ANSWERS, US_LOCALE);
    const fullRenewable = calculateEmissions({ ...BASE_ANSWERS, q9_renewable_pct: 100 }, US_LOCALE);
    expect(fullRenewable.energy).toBeLessThan(noRenewable.energy);
  });

  it('vegan diet produces less food emissions than heavy meat', () => {
    const meat = calculateEmissions({ ...BASE_ANSWERS, q10_diet: 0 }, US_LOCALE);
    const vegan = calculateEmissions({ ...BASE_ANSWERS, q10_diet: 4 }, US_LOCALE);
    expect(vegan.food).toBeLessThan(meat.food);
  });

  it('strict recycling reduces waste', () => {
    const noRecycling = calculateEmissions({ ...BASE_ANSWERS, q14_recycling: 0 }, US_LOCALE);
    const strictRecycling = calculateEmissions({ ...BASE_ANSWERS, q14_recycling: 2 }, US_LOCALE);
    expect(strictRecycling.waste).toBeLessThan(noRecycling.waste);
  });

  it('handles zero distance gracefully', () => {
    const answers = { ...BASE_ANSWERS, q2_weekly_distance: 0, q5_short_flights: 0, q6_long_flights: 0 };
    const result = calculateEmissions(answers, US_LOCALE);
    expect(result.flights).toBe(0);
    expect(result.transport).toBeGreaterThanOrEqual(0);
  });

  it('handles all zero answers', () => {
    const zeroAnswers: QuizAnswers = {
      q1_transport_mode: 0, q2_weekly_distance: 0, q3_public_transit_hours: 0,
      q4_rideshare_frequency: 0, q5_short_flights: 0, q6_long_flights: 0,
      q7_electricity_bill: 0, q8_heating_fuel: 0, q9_renewable_pct: 0,
      q10_diet: 0, q11_local_food: 0, q12_food_waste: 0,
      q13_garbage_bags: 0, q14_recycling: 0, q15_shopping: 0,
    };
    const result = calculateEmissions(zeroAnswers, US_LOCALE);
    expect(result.transport).toBe(0);
    expect(result.flights).toBe(0);
    expect(result.total).toBeGreaterThan(0); // food and waste still have base values
  });

  it('rides more often produces more rideshare emissions', () => {
    const never = calculateEmissions({ ...BASE_ANSWERS, q4_rideshare_frequency: 0 }, US_LOCALE);
    const daily = calculateEmissions({ ...BASE_ANSWERS, q4_rideshare_frequency: 3 }, US_LOCALE);
    expect(daily.transport).toBeGreaterThan(never.transport);
  });
});

describe('getWorstCategory', () => {
  it('identifies transport as worst when it dominates', () => {
    const breakdown = { transport: 5000, flights: 500, energy: 300, food: 200, waste: 100, total: 6100 };
    expect(getWorstCategory(breakdown)).toBe('transport');
  });

  it('identifies energy as worst when it dominates', () => {
    const breakdown = { transport: 500, flights: 500, energy: 5000, food: 200, waste: 100, total: 6300 };
    expect(getWorstCategory(breakdown)).toBe('energy');
  });

  it('identifies food as worst when it dominates', () => {
    const breakdown = { transport: 500, flights: 500, energy: 300, food: 5000, waste: 100, total: 6400 };
    expect(getWorstCategory(breakdown)).toBe('food');
  });
});

describe('getReductionPct', () => {
  it('returns 0 when baseline equals current', () => {
    expect(getReductionPct(1000, 1000)).toBe(0);
  });

  it('returns 50 for half reduction', () => {
    expect(getReductionPct(1000, 500)).toBe(50);
  });

  it('returns 0 when current exceeds baseline (increase)', () => {
    expect(getReductionPct(1000, 1500)).toBe(0);
  });

  it('returns 100 for full reduction to zero', () => {
    expect(getReductionPct(1000, 0)).toBe(100);
  });

  it('returns 0 when baseline is zero', () => {
    expect(getReductionPct(0, 0)).toBe(0);
  });

  it('clamps to 100 max', () => {
    expect(getReductionPct(100, -500)).toBe(100);
  });

  it('handles fractional reductions', () => {
    const result = getReductionPct(1000, 850);
    expect(result).toBeCloseTo(15, 1);
  });
});

describe('getGardenLevel', () => {
  it('returns level 1 for 0% reduction', () => {
    expect(getGardenLevel(0)).toBe(1);
  });

  it('returns level 2 for 1% reduction', () => {
    expect(getGardenLevel(1)).toBe(2);
  });

  it('returns level 3 for 6% reduction', () => {
    expect(getGardenLevel(6)).toBe(3);
  });

  it('returns level 4 for 15% reduction', () => {
    expect(getGardenLevel(15)).toBe(4);
  });

  it('returns level 5 for 25% reduction', () => {
    expect(getGardenLevel(25)).toBe(5);
  });

  it('returns level 5 for 50% reduction', () => {
    expect(getGardenLevel(50)).toBe(5);
  });

  it('returns level 3 for 10% reduction', () => {
    expect(getGardenLevel(10)).toBe(3);
  });

  it('returns level 1 for negative reduction', () => {
    expect(getGardenLevel(-5)).toBe(1);
  });
});
