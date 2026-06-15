import { QuizAnswers, EmissionBreakdown, LocaleConfig } from '../types';

const TRANSPORT_MODE_FACTOR = [1.0, 0.75, 0.5, 0.15, 0.1, 0.0];
const RIDESHARE_FACTOR = [0, 0.8, 2.0, 4.5];
const SHORT_FLIGHT_FACTOR = 0.255;
const LONG_FLIGHT_FACTOR = 0.195;
const HEATING_FUEL_FACTOR = [1.0, 0.6, 1.5, 0.05];
const DIET_FACTOR = [3.3, 2.5, 1.9, 1.7, 1.5];
const LOCAL_FOOD_FACTOR = [1.2, 1.0, 0.85];
const FOOD_WASTE_FACTOR = [1.3, 1.0, 0.85];
const RECYCLING_FACTOR = [1.0, 0.7, 0.4];
const SHOPPING_FACTOR = [2.5, 1.5, 0.8];

export function calculateEmissions(answers: QuizAnswers, locale: LocaleConfig): EmissionBreakdown {
  const modeFactor = TRANSPORT_MODE_FACTOR[answers.q1_transport_mode] ?? 1.0;
  const weeklyDistEmissions = answers.q2_weekly_distance * locale.distFactor * modeFactor;
  const publicTransitSavings = answers.q3_public_transit_hours * 0.5;
  const rideshareEmissions = RIDESHARE_FACTOR[answers.q4_rideshare_frequency] ?? 0;
  const transport = Math.max(0, (weeklyDistEmissions + rideshareEmissions - publicTransitSavings) * 52);

  const shortFlightKm = locale.distanceUnit === 'miles'
    ? answers.q5_short_flights * 500 * 1.609
    : answers.q5_short_flights * 800;
  const longFlightKm = locale.distanceUnit === 'miles'
    ? answers.q6_long_flights * 2500 * 1.609
    : answers.q6_long_flights * 4000;
  const flights = shortFlightKm * SHORT_FLIGHT_FACTOR + longFlightKm * LONG_FLIGHT_FACTOR;

  const electricityEmissions = answers.q7_electricity_bill * 12 * locale.electricityFactor;
  const heatingFactor = HEATING_FUEL_FACTOR[answers.q8_heating_fuel] ?? 1.0;
  const heatingEmissions = answers.q7_electricity_bill * 0.3 * 12 * locale.gasFactor * heatingFactor;
  const renewableReduction = 1 - answers.q9_renewable_pct / 100;
  const energy = (electricityEmissions + heatingEmissions) * renewableReduction;

  const dietBase = (DIET_FACTOR[answers.q10_diet] ?? 2.5) * 1000;
  const localMult = LOCAL_FOOD_FACTOR[answers.q11_local_food] ?? 1.0;
  const wasteMult = FOOD_WASTE_FACTOR[answers.q12_food_waste] ?? 1.0;
  const food = dietBase * localMult * wasteMult;

  const garbageBase = answers.q13_garbage_bags * 52 * 2.5;
  const recyclingMult = RECYCLING_FACTOR[answers.q14_recycling] ?? 1.0;
  const shoppingBase = (SHOPPING_FACTOR[answers.q15_shopping] ?? 1.5) * 1000;
  const waste = garbageBase * recyclingMult + shoppingBase;

  const total = transport + flights + energy + food + waste;
  return {
    transport: Math.round(transport),
    flights: Math.round(flights),
    energy: Math.round(energy),
    food: Math.round(food),
    waste: Math.round(waste),
    total: Math.round(total),
  };
}

export function getWorstCategory(breakdown: EmissionBreakdown): 'transport' | 'flights' | 'energy' | 'food' | 'waste' {
  const entries: [string, number][] = [
    ['transport', breakdown.transport], ['flights', breakdown.flights],
    ['energy', breakdown.energy], ['food', breakdown.food], ['waste', breakdown.waste],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0] as 'transport' | 'flights' | 'energy' | 'food' | 'waste';
}

export function getReductionPct(baseline: number, current: number): number {
  if (baseline <= 0) return 0;
  return Math.max(0, Math.min(100, ((baseline - current) / baseline) * 100));
}

export function getGardenLevel(reductionPct: number): 1 | 2 | 3 | 4 | 5 {
  if (reductionPct >= 25) return 5;
  if (reductionPct >= 15) return 4;
  if (reductionPct >= 6) return 3;
  if (reductionPct >= 1) return 2;
  return 1;
}
