import { describe, it, expect } from 'vitest';
import { getBadgeStyle, getBadgeLetter, getBadgeLabel, getRankStyle } from '../services/rankings';
import { Badge } from '../types';

describe('getBadgeStyle', () => {
  it('returns earned style for earned bronze badge', () => {
    expect(getBadgeStyle('bronze', true)).toContain('bg-orange-400');
  });

  it('returns unearned style for unearned badge', () => {
    expect(getBadgeStyle('bronze', false)).toContain('bg-gray-100');
  });

  it('returns earned style for earned gold badge', () => {
    expect(getBadgeStyle('gold', true)).toContain('bg-yellow-500');
  });

  it('returns earned style for earned platinum badge', () => {
    expect(getBadgeStyle('platinum', true)).toContain('bg-emerald-600');
  });
});

describe('getBadgeLetter', () => {
  it('returns B for bronze', () => {
    expect(getBadgeLetter('bronze')).toBe('B');
  });

  it('returns S for silver', () => {
    expect(getBadgeLetter('silver')).toBe('S');
  });

  it('returns G for gold', () => {
    expect(getBadgeLetter('gold')).toBe('G');
  });

  it('returns P for platinum', () => {
    expect(getBadgeLetter('platinum')).toBe('P');
  });
});

describe('getBadgeLabel', () => {
  it('labels earned badge', () => {
    const badge: Badge = { id: 'bronze', name: 'Bronze', description: 'Test', earned: true, earnedAt: 1000 };
    expect(getBadgeLabel(badge)).toContain('earned');
  });

  it('labels unearned badge', () => {
    const badge: Badge = { id: 'gold', name: 'Gold', description: 'Test', earned: false, earnedAt: null };
    expect(getBadgeLabel(badge)).toContain('not yet earned');
  });
});

describe('getRankStyle', () => {
  it('returns yellow style for rank 1', () => {
    expect(getRankStyle(1)).toContain('yellow');
  });

  it('returns gray style for rank 2', () => {
    expect(getRankStyle(2)).toContain('gray');
  });

  it('returns orange style for rank 3', () => {
    expect(getRankStyle(3)).toContain('orange');
  });

  it('returns default style for rank 4+', () => {
    expect(getRankStyle(4)).toContain('bg-white');
    expect(getRankStyle(50)).toContain('bg-white');
  });
});
