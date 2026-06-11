export type Country = 'US' | 'India' | 'UK' | 'Germany' | 'France' | 'Spain' | 'Italy' | 'Netherlands' | 'Sweden' | 'Norway';

export interface LocaleConfig {
  distanceUnit: 'miles' | 'km';
  currencySymbol: string;
  currencyCode: string;
  emissionSource: string;
  distFactor: number;
  electricityFactor: number;
  gasFactor: number;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  country: Country;
  city: string;
  createdAt: number;
}

export interface QuizAnswers {
  q1_transport_mode: number;
  q2_weekly_distance: number;
  q3_public_transit_hours: number;
  q4_rideshare_frequency: number;
  q5_short_flights: number;
  q6_long_flights: number;
  q7_electricity_bill: number;
  q8_heating_fuel: number;
  q9_renewable_pct: number;
  q10_diet: number;
  q11_local_food: number;
  q12_food_waste: number;
  q13_garbage_bags: number;
  q14_recycling: number;
  q15_shopping: number;
}

export interface EmissionBreakdown {
  transport: number;
  flights: number;
  energy: number;
  food: number;
  waste: number;
  total: number;
}

export interface WeeklyCheckin {
  id: string;
  userId: string;
  checkinDate: number;
  transportEmissions: number;
  energyEmissions: number;
  foodEmissions: number;
  wasteEmissions: number;
  totalNetEmissions: number;
  gardenStateLevel: number;
}

export interface ActionItem {
  id: string;
  userId: string;
  category: 'transport' | 'energy' | 'food' | 'waste' | 'general';
  title: string;
  description: string;
  co2SavingKg: number;
  completed: boolean;
  completedAt: number | null;
}

export interface Badge {
  id: 'bronze' | 'silver' | 'gold' | 'platinum';
  name: string;
  description: string;
  earned: boolean;
  earnedAt: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  country: Country;
  city: string;
  netFootprint: number;
  ecoPoints: number;
  streak: number;
  badges: Badge[];
}
