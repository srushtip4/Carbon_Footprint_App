import { Country, LocaleConfig } from '../types';

const LOCALE_MAP: Record<Country, LocaleConfig> = {
  US: { distanceUnit: 'miles', currencySymbol: '$', currencyCode: 'USD', emissionSource: 'EPA', distFactor: 0.411, electricityFactor: 0.85, gasFactor: 0.55 },
  India: { distanceUnit: 'km', currencySymbol: '₹', currencyCode: 'INR', emissionSource: 'DEFRA/Central Electricity Authority', distFactor: 0.175, electricityFactor: 0.012, gasFactor: 0.008 },
  UK: { distanceUnit: 'miles', currencySymbol: '£', currencyCode: 'GBP', emissionSource: 'DEFRA', distFactor: 0.290, electricityFactor: 1.43, gasFactor: 1.10 },
  Germany: { distanceUnit: 'km', currencySymbol: '€', currencyCode: 'EUR', emissionSource: 'DEFRA', distFactor: 0.175, electricityFactor: 0.17, gasFactor: 0.14 },
  France: { distanceUnit: 'km', currencySymbol: '€', currencyCode: 'EUR', emissionSource: 'DEFRA', distFactor: 0.175, electricityFactor: 0.025, gasFactor: 0.14 },
  Spain: { distanceUnit: 'km', currencySymbol: '€', currencyCode: 'EUR', emissionSource: 'DEFRA', distFactor: 0.175, electricityFactor: 0.10, gasFactor: 0.14 },
  Italy: { distanceUnit: 'km', currencySymbol: '€', currencyCode: 'EUR', emissionSource: 'DEFRA', distFactor: 0.175, electricityFactor: 0.12, gasFactor: 0.14 },
  Netherlands: { distanceUnit: 'km', currencySymbol: '€', currencyCode: 'EUR', emissionSource: 'DEFRA', distFactor: 0.175, electricityFactor: 0.13, gasFactor: 0.14 },
  Sweden: { distanceUnit: 'km', currencySymbol: 'kr', currencyCode: 'SEK', emissionSource: 'DEFRA', distFactor: 0.175, electricityFactor: 0.013, gasFactor: 0.011 },
  Norway: { distanceUnit: 'km', currencySymbol: 'kr', currencyCode: 'NOK', emissionSource: 'DEFRA', distFactor: 0.175, electricityFactor: 0.008, gasFactor: 0.007 },
};

export function getLocale(country: Country): LocaleConfig {
  return LOCALE_MAP[country];
}

export const COUNTRIES: { value: Country; label: string }[] = [
  { value: 'US', label: 'United States' },
  { value: 'India', label: 'India' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Sweden', label: 'Sweden' },
  { value: 'Norway', label: 'Norway' },
];

export const CITIES: Record<Country, string[]> = {
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco', 'Seattle', 'Denver'],
  India: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur'],
  UK: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol', 'Leeds', 'Glasgow', 'Cardiff'],
  Germany: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Dresden', 'Leipzig'],
  France: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Bordeaux'],
  Spain: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Malaga', 'Zaragoza', 'Granada'],
  Italy: ['Rome', 'Milan', 'Naples', 'Florence', 'Venice', 'Turin', 'Bologna', 'Palermo'],
  Netherlands: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Maastricht', 'Leiden'],
  Sweden: ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala', 'Linkoping', 'Lund', 'Umea', 'Orebro'],
  Norway: ['Oslo', 'Bergen', 'Stavanger', 'Trondheim', 'Tromso', 'Drammen', 'Kristiansand', 'Bodo'],
};
