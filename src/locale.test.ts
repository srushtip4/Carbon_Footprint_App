import { describe, it, expect } from 'vitest';
import { getLocale, COUNTRIES, CITIES } from '../utils/locale';
import { Country } from '../types';

describe('getLocale', () => {
  it('returns a locale for every supported country', () => {
    const countries: Country[] = ['US', 'India', 'UK', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway'];
    countries.forEach(c => {
      const locale = getLocale(c);
      expect(locale).toBeDefined();
      expect(locale.currencySymbol).toBeTruthy();
      expect(locale.emissionSource).toBeTruthy();
      expect(locale.distFactor).toBeGreaterThan(0);
      expect(locale.electricityFactor).toBeGreaterThanOrEqual(0);
      expect(locale.gasFactor).toBeGreaterThanOrEqual(0);
    });
  });

  it('US uses miles', () => {
    expect(getLocale('US').distanceUnit).toBe('miles');
  });

  it('Germany uses km', () => {
    expect(getLocale('Germany').distanceUnit).toBe('km');
  });

  it('US uses dollar symbol', () => {
    expect(getLocale('US').currencySymbol).toBe('$');
  });

  it('India uses rupee symbol', () => {
    expect(getLocale('India').currencySymbol).toBe('₹');
  });
});

describe('COUNTRIES', () => {
  it('has 10 countries', () => {
    expect(COUNTRIES.length).toBe(10);
  });

  it('each country has a value and label', () => {
    COUNTRIES.forEach(c => {
      expect(c.value).toBeTruthy();
      expect(c.label).toBeTruthy();
    });
  });
});

describe('CITIES', () => {
  it('every country has at least one city', () => {
    const countries: Country[] = ['US', 'India', 'UK', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway'];
    countries.forEach(c => {
      expect(CITIES[c].length).toBeGreaterThan(0);
    });
  });
});
