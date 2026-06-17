import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateName,
  validatePassword,
  getPasswordStrength,
  validateNumberInput,
  sanitizeText,
  validateCity,
} from '../utils/validation';

describe('validateEmail', () => {
  it('accepts valid email', () => {
    expect(validateEmail('user@example.com').valid).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateEmail('').valid).toBe(false);
  });

  it('rejects whitespace-only', () => {
    expect(validateEmail('   ').valid).toBe(false);
  });

  it('rejects missing @', () => {
    expect(validateEmail('userexample.com').valid).toBe(false);
  });

  it('rejects missing domain', () => {
    expect(validateEmail('user@').valid).toBe(false);
  });

  it('rejects missing TLD', () => {
    expect(validateEmail('user@example').valid).toBe(false);
  });

  it('rejects double @', () => {
    expect(validateEmail('user@@example.com').valid).toBe(false);
  });

  it('trims whitespace before validating', () => {
    expect(validateEmail('  user@example.com  ').valid).toBe(true);
  });

  it('rejects overly long email', () => {
    const long = 'a'.repeat(250) + '@example.com';
    expect(validateEmail(long).valid).toBe(false);
  });
});

describe('validateName', () => {
  it('accepts valid name', () => {
    expect(validateName('John Doe').valid).toBe(true);
  });

  it('rejects empty name', () => {
    expect(validateName('').valid).toBe(false);
  });

  it('rejects single character', () => {
    expect(validateName('A').valid).toBe(false);
  });

  it('rejects HTML characters', () => {
    expect(validateName('<script>').valid).toBe(false);
  });

  it('rejects quote characters', () => {
    expect(validateName('Test"Name').valid).toBe(false);
  });

  it('trims whitespace', () => {
    expect(validateName('  Jane  ').valid).toBe(true);
  });

  it('rejects overly long name', () => {
    expect(validateName('A'.repeat(101)).valid).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts 6-character password', () => {
    expect(validatePassword('abcdef').valid).toBe(true);
  });

  it('rejects empty password', () => {
    expect(validatePassword('').valid).toBe(false);
  });

  it('rejects 5-character password', () => {
    expect(validatePassword('abcde').valid).toBe(false);
  });

  it('rejects overly long password', () => {
    expect(validatePassword('a'.repeat(129)).valid).toBe(false);
  });
});

describe('getPasswordStrength', () => {
  it('returns score 0 for empty password', () => {
    expect(getPasswordStrength('').score).toBe(0);
  });

  it('returns score 1 for minimum valid password', () => {
    expect(getPasswordStrength('abcdef').score).toBe(1);
  });

  it('returns score 4 for strong password', () => {
    expect(getPasswordStrength('MyP@ss123').score).toBe(4);
  });

  it('includes suggestions for weak passwords', () => {
    const result = getPasswordStrength('abc');
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('always returns a label', () => {
    expect(getPasswordStrength('test').label).toBeTruthy();
  });

  it('always returns a color', () => {
    expect(getPasswordStrength('test').color).toBeTruthy();
  });

  it('increases score with mixed case', () => {
    const lower = getPasswordStrength('abcdef');
    const mixed = getPasswordStrength('aBcDeF');
    expect(mixed.score).toBeGreaterThanOrEqual(lower.score);
  });

  it('increases score with digits', () => {
    const nodigit = getPasswordStrength('abcdef');
    const withdigit = getPasswordStrength('abcde6');
    expect(withdigit.score).toBeGreaterThanOrEqual(nodigit.score);
  });

  it('increases score with special chars', () => {
    const nospecial = getPasswordStrength('Abcde6');
    const withspecial = getPasswordStrength('Abcde6!');
    expect(withspecial.score).toBeGreaterThanOrEqual(nospecial.score);
  });
});

describe('validateNumberInput', () => {
  it('accepts value within range', () => {
    expect(validateNumberInput(5, 0, 10, 'Test').valid).toBe(true);
  });

  it('rejects undefined', () => {
    expect(validateNumberInput(undefined, 0, 10, 'Test').valid).toBe(false);
  });

  it('rejects NaN', () => {
    expect(validateNumberInput(NaN, 0, 10, 'Test').valid).toBe(false);
  });

  it('rejects value below min', () => {
    expect(validateNumberInput(-1, 0, 10, 'Test').valid).toBe(false);
  });

  it('rejects value above max', () => {
    expect(validateNumberInput(11, 0, 10, 'Test').valid).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(validateNumberInput(Infinity, 0, 100, 'Test').valid).toBe(false);
  });

  it('accepts min boundary', () => {
    expect(validateNumberInput(0, 0, 10, 'Test').valid).toBe(true);
  });

  it('accepts max boundary', () => {
    expect(validateNumberInput(10, 0, 10, 'Test').valid).toBe(true);
  });

  it('includes label in error message', () => {
    const result = validateNumberInput(-1, 0, 10, 'Distance');
    expect(result.error).toContain('Distance');
  });
});

describe('sanitizeText', () => {
  it('removes HTML tags', () => {
    expect(sanitizeText('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('removes quotes', () => {
    expect(sanitizeText('test"value')).toBe('testvalue');
  });

  it('removes ampersands', () => {
    expect(sanitizeText('a&b')).toBe('ab');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('preserves safe characters', () => {
    expect(sanitizeText('Hello World 123')).toBe('Hello World 123');
  });
});

describe('validateCity', () => {
  it('accepts non-empty city', () => {
    expect(validateCity('New York').valid).toBe(true);
  });

  it('rejects empty city', () => {
    expect(validateCity('').valid).toBe(false);
  });

  it('rejects whitespace-only city', () => {
    expect(validateCity('   ').valid).toBe(false);
  });
});
