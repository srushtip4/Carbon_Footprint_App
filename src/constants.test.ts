import { describe, it, expect } from 'vitest';
import {
  ROUTES,
  CHART_COLORS,
  BADGE_IDS,
  BADGE_THRESHOLDS,
  GARDEN_PHASES,
  VALIDATION,
  QUIZ_POINTS_AWARD,
  CHECKIN_POINTS_AWARD,
  ACTION_POINTS_AWARD,
  DEFAULT_BADGES,
} from '../constants';

describe('ROUTES', () => {
  it('has all expected route keys', () => {
    expect(ROUTES.AUTH).toBe('auth');
    expect(ROUTES.EDUCATION).toBe('education');
    expect(ROUTES.DASHBOARD).toBe('dashboard');
    expect(ROUTES.QUIZ).toBe('quiz');
    expect(ROUTES.ACTIONS).toBe('actions');
    expect(ROUTES.GARDEN).toBe('garden');
    expect(ROUTES.LEADERBOARD).toBe('leaderboard');
  });
});

describe('CHART_COLORS', () => {
  it('has 5 colors', () => {
    expect(CHART_COLORS.length).toBe(5);
  });

  it('all colors are valid hex strings', () => {
    CHART_COLORS.forEach(c => {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});

describe('BADGE_IDS', () => {
  it('contains the 4 expected badges', () => {
    expect(BADGE_IDS).toEqual(['bronze', 'silver', 'gold', 'platinum']);
  });
});

describe('BADGE_THRESHOLDS', () => {
  it('has all required threshold keys', () => {
    expect(BADGE_THRESHOLDS.SILVER_POINTS).toBeTypeOf('number');
    expect(BADGE_THRESHOLDS.SILVER_STREAK).toBeTypeOf('number');
    expect(BADGE_THRESHOLDS.GOLD_POINTS).toBeTypeOf('number');
    expect(BADGE_THRESHOLDS.GOLD_REDUCTION_PCT).toBeTypeOf('number');
    expect(BADGE_THRESHOLDS.PLATINUM_RANK).toBeTypeOf('number');
  });
});

describe('GARDEN_PHASES', () => {
  it('has 5 phases', () => {
    expect(GARDEN_PHASES.length).toBe(5);
  });

  it('phases are ordered by level ascending', () => {
    for (let i = 1; i < GARDEN_PHASES.length; i++) {
      expect(GARDEN_PHASES[i].level).toBeGreaterThan(GARDEN_PHASES[i - 1].level);
    }
  });

  it('min reduction percentages are non-decreasing', () => {
    for (let i = 1; i < GARDEN_PHASES.length; i++) {
      expect(GARDEN_PHASES[i].minReductionPct).toBeGreaterThanOrEqual(GARDEN_PHASES[i - 1].minReductionPct);
    }
  });
});

describe('VALIDATION', () => {
  it('has reasonable limits', () => {
    expect(VALIDATION.EMAIL_MAX_LENGTH).toBeGreaterThan(0);
    expect(VALIDATION.NAME_MIN_LENGTH).toBeGreaterThan(0);
    expect(VALIDATION.NAME_MAX_LENGTH).toBeGreaterThan(VALIDATION.NAME_MIN_LENGTH);
    expect(VALIDATION.PASSWORD_MIN_LENGTH).toBeGreaterThan(0);
    expect(VALIDATION.PASSWORD_MAX_LENGTH).toBeGreaterThan(VALIDATION.PASSWORD_MIN_LENGTH);
  });
});

describe('Points awards', () => {
  it('quiz award is positive', () => {
    expect(QUIZ_POINTS_AWARD).toBeGreaterThan(0);
  });

  it('checkin award is positive', () => {
    expect(CHECKIN_POINTS_AWARD).toBeGreaterThan(0);
  });

  it('action award is positive', () => {
    expect(ACTION_POINTS_AWARD).toBeGreaterThan(0);
  });
});

describe('DEFAULT_BADGES', () => {
  it('has 4 badges', () => {
    expect(DEFAULT_BADGES.length).toBe(4);
  });

  it('all badges start unearned', () => {
    DEFAULT_BADGES.forEach(b => {
      expect(b.earned).toBe(false);
      expect(b.earnedAt).toBeNull();
    });
  });

  it('badge IDs match BADGE_IDS', () => {
    expect(DEFAULT_BADGES.map(b => b.id)).toEqual([...BADGE_IDS]);
  });
});
