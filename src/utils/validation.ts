/**
 * Centralized input validation and sanitization utilities.
 *
 * All validation functions return a {@link ValidationResult} object with
 * a `valid` boolean and an `error` message (empty string when valid).
 */
import { VALIDATION } from '../constants';

export interface ValidationResult {
  valid: boolean;
  error: string;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  suggestions: string[];
}

const PASSWORD_STRENGTH_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Very Weak', color: '#ef4444' },
  1: { label: 'Weak', color: '#f97316' },
  2: { label: 'Fair', color: '#eab308' },
  3: { label: 'Good', color: '#22c55e' },
  4: { label: 'Strong', color: '#059669' },
};

const UNSAFE_CHARS_REGEX = /[<>"'&]/g;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validate an email address.
 *
 * @param email - Raw email input
 * @returns Validation result with error message if invalid
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: 'Email is required.' };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: 'Please enter a valid email address.' };
  if (trimmed.length > VALIDATION.EMAIL_MAX_LENGTH) return { valid: false, error: 'Email is too long.' };
  return { valid: true, error: '' };
}

/**
 * Validate a full name.
 *
 * @param name - Raw name input
 * @returns Validation result
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: 'Full name is required.' };
  if (trimmed.length < VALIDATION.NAME_MIN_LENGTH) return { valid: false, error: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters.` };
  if (trimmed.length > VALIDATION.NAME_MAX_LENGTH) return { valid: false, error: 'Name is too long.' };
  const safeName = trimmed.replace(UNSAFE_CHARS_REGEX, '');
  if (safeName !== trimmed) return { valid: false, error: 'Name contains invalid characters.' };
  return { valid: true, error: '' };
}

/**
 * Validate a password against minimum strength requirements.
 *
 * @param password - Raw password input
 * @returns Validation result
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, error: 'Password is required.' };
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) return { valid: false, error: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.` };
  if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) return { valid: false, error: 'Password is too long.' };
  return { valid: true, error: '' };
}

/**
 * Score password strength on a 0-4 scale with actionable suggestions.
 *
 * @param password - Raw password input
 * @returns PasswordStrength with score, label, color, and up to 3 suggestions
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: 'None', color: '#d1d5db', suggestions: ['Enter a password'] };
  let rawScore = 0;
  const suggestions: string[] = [];
  if (password.length >= VALIDATION.PASSWORD_MIN_LENGTH) rawScore++; else suggestions.push('Use at least 6 characters');
  if (password.length >= 10) rawScore++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) rawScore++; else suggestions.push('Mix uppercase and lowercase');
  if (/\d/.test(password)) rawScore++; else suggestions.push('Add a number');
  if (/[^a-zA-Z\d]/.test(password)) rawScore++; else suggestions.push('Add a special character');
  const score = Math.min(4, rawScore) as 0 | 1 | 2 | 3 | 4;
  return { score, ...PASSWORD_STRENGTH_LABELS[score], suggestions: suggestions.slice(0, 3) };
}

/**
 * Validate a numeric input against min/max bounds.
 *
 * @param value - The numeric value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param label - Human-readable field label for error messages
 * @returns Validation result
 */
export function validateNumberInput(value: number | undefined, min: number, max: number, label: string): ValidationResult {
  if (value === undefined || value === null || isNaN(value)) return { valid: false, error: `${label} is required.` };
  if (!Number.isFinite(value)) return { valid: false, error: `${label} must be a valid number.` };
  if (value < min) return { valid: false, error: `${label} must be at least ${min}.` };
  if (value > max) return { valid: false, error: `${label} must be at most ${max}.` };
  return { valid: true, error: '' };
}

/**
 * Strip unsafe HTML characters from text input.
 *
 * @param input - Raw text input
 * @returns Sanitized string with <, >, ", ', & removed and whitespace trimmed
 */
export function sanitizeText(input: string): string {
  return input.replace(UNSAFE_CHARS_REGEX, '').trim();
}

/**
 * Validate that a city was selected.
 *
 * @param city - City selection value
 * @returns Validation result
 */
export function validateCity(city: string): ValidationResult {
  if (!city.trim()) return { valid: false, error: 'Please select a city.' };
  return { valid: true, error: '' };
}

/**
 * Sanitize text for safe HTML display (XSS prevention).
 *
 * @param input - Raw text that might contain HTML
 * @returns HTML-escaped string
 */
export function sanitizeForDisplay(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
