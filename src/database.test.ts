import { describe, it, expect, beforeEach } from 'vitest';
import {
  createUser,
  authenticateUser,
  getUserById,
  getUserByEmail,
  resetUserPassword,
  saveQuizAnswers,
  getQuizAnswers,
  saveCheckin,
  getCheckins,
  saveAction,
  getActions,
  getBadges,
  saveBadges,
  getEcoPoints,
  saveEcoPoints,
  getStreak,
  saveStreak,
  generateId,
} from '../db/database';
import { QuizAnswers, EmissionBreakdown, ActionItem } from '../types';

const SAMPLE_ANSWERS: QuizAnswers = {
  q1_transport_mode: 1, q2_weekly_distance: 50, q3_public_transit_hours: 2,
  q4_rideshare_frequency: 0, q5_short_flights: 2, q6_long_flights: 1,
  q7_electricity_bill: 100, q8_heating_fuel: 1, q9_renewable_pct: 25,
  q10_diet: 2, q11_local_food: 1, q12_food_waste: 1,
  q13_garbage_bags: 2, q14_recycling: 1, q15_shopping: 1,
};

const SAMPLE_EMISSIONS: EmissionBreakdown = {
  transport: 500, flights: 200, energy: 300, food: 400, waste: 100, total: 1500,
};

describe('generateId', () => {
  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('returns a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('is non-empty', () => {
    expect(generateId().length).toBeGreaterThan(0);
  });
});

describe('User CRUD', () => {
  it('creates and retrieves a user', async () => {
    const user = await createUser('test@example.com', 'password123', 'Test User', 'US', 'New York');
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
    expect(user.id).toBeTruthy();

    const fetched = await getUserById(user.id);
    expect(fetched).toBeTruthy();
    expect(fetched!.email).toBe('test@example.com');
  });

  it('authenticates with correct password', async () => {
    await createUser('auth@example.com', 'mypassword', 'Auth Test', 'US', 'New York');
    const user = await authenticateUser('auth@example.com', 'mypassword');
    expect(user).toBeTruthy();
    expect(user!.email).toBe('auth@example.com');
  });

  it('rejects wrong password', async () => {
    await createUser('wrong@example.com', 'password123', 'Wrong Test', 'US', 'New York');
    const user = await authenticateUser('wrong@example.com', 'wrongpass');
    expect(user).toBeNull();
  });

  it('rejects empty credentials', async () => {
    const user = await authenticateUser('', '');
    expect(user).toBeNull();
  });

  it('finds user by email', async () => {
    await createUser('find@example.com', 'password123', 'Find Test', 'US', 'New York');
    const user = await getUserByEmail('find@example.com');
    expect(user).toBeTruthy();
    expect(user!.name).toBe('Find Test');
  });

  it('returns null for non-existent email', async () => {
    const user = await getUserByEmail('nonexistent@example.com');
    expect(user).toBeNull();
  });

  it('resets password', async () => {
    await createUser('reset@example.com', 'oldpassword', 'Reset Test', 'US', 'New York');
    const result = await resetUserPassword('reset@example.com', 'newpassword123');
    expect(result).toBe(true);
    const user = await authenticateUser('reset@example.com', 'newpassword123');
    expect(user).toBeTruthy();
  });

  it('rejects password reset for non-existent user', async () => {
    const result = await resetUserPassword('nobody@example.com', 'newpassword123');
    expect(result).toBe(false);
  });

  it('rejects weak password on creation', async () => {
    await expect(createUser('weak@example.com', 'abc', 'Weak Test', 'US', 'NY')).rejects.toThrow();
  });

  it('rejects invalid email on creation', async () => {
    await expect(createUser('notanemail', 'password123', 'Bad Email', 'US', 'NY')).rejects.toThrow();
  });

  it('sanitizes name on creation', async () => {
    const user = await createUser('sanitize@example.com', 'password123', '<script>Test</script>', 'US', 'NY');
    expect(user.name).not.toContain('<');
    expect(user.name).not.toContain('>');
  });

  it('sanitizes email on creation', async () => {
    const user = await createUser('test"quotes@example.com', 'password123', 'Test', 'US', 'NY');
    expect(user.email).not.toContain('"');
  });
});

describe('Quiz storage', () => {
  it('saves and retrieves quiz answers', async () => {
    const user = await createUser('quiz@example.com', 'password123', 'Quiz Test', 'US', 'New York');
    await saveQuizAnswers(user.id, SAMPLE_ANSWERS, SAMPLE_EMISSIONS);
    const data = await getQuizAnswers(user.id);
    expect(data).toBeTruthy();
    expect(data!.answers.q1_transport_mode).toBe(1);
    expect(data!.emissions.total).toBe(1500);
  });

  it('returns null for user with no quiz', async () => {
    const user = await createUser('noquiz@example.com', 'password123', 'No Quiz', 'US', 'NY');
    const data = await getQuizAnswers(user.id);
    expect(data).toBeNull();
  });

  it('rejects invalid quiz data', async () => {
    const user = await createUser('badquiz@example.com', 'password123', 'Bad Quiz', 'US', 'NY');
    const badAnswers = { ...SAMPLE_ANSWERS, q2_weekly_distance: 9999 };
    await expect(saveQuizAnswers(user.id, badAnswers, SAMPLE_EMISSIONS)).rejects.toThrow();
  });

  it('rejects missing userId', async () => {
    await expect(saveQuizAnswers('', SAMPLE_ANSWERS, SAMPLE_EMISSIONS)).rejects.toThrow();
  });
});

describe('Check-in storage', () => {
  it('saves and retrieves checkins', async () => {
    const user = await createUser('checkin@example.com', 'password123', 'Checkin Test', 'US', 'NY');
    const checkin = {
      id: generateId(), userId: user.id, checkinDate: Date.now(),
      transportEmissions: 400, energyEmissions: 250, foodEmissions: 350,
      wasteEmissions: 80, totalNetEmissions: 1280, gardenStateLevel: 2 as const,
    };
    await saveCheckin(checkin);
    const checkins = await getCheckins(user.id);
    expect(checkins.length).toBe(1);
    expect(checkins[0].totalNetEmissions).toBe(1280);
  });

  it('returns empty array for user with no checkins', async () => {
    const user = await createUser('nocheckin@example.com', 'password123', 'No Checkin', 'US', 'NY');
    const checkins = await getCheckins(user.id);
    expect(checkins).toEqual([]);
  });

  it('rejects checkin with negative emissions', async () => {
    const checkin = {
      id: generateId(), userId: 'user1', checkinDate: Date.now(),
      transportEmissions: 0, energyEmissions: 0, foodEmissions: 0,
      wasteEmissions: 0, totalNetEmissions: -100, gardenStateLevel: 1 as const,
    };
    await expect(saveCheckin(checkin)).rejects.toThrow();
  });
});

describe('Action storage', () => {
  it('saves and retrieves actions', async () => {
    const user = await createUser('action@example.com', 'password123', 'Action Test', 'US', 'NY');
    const action: ActionItem = {
      id: generateId(), userId: user.id, category: 'transport',
      title: 'Carpooled today', description: 'Shared a ride', co2SavingKg: 2.5,
      completed: false, completedAt: null,
    };
    await saveAction(action);
    const actions = await getActions(user.id);
    expect(actions.length).toBe(1);
    expect(actions[0].title).toBe('Carpooled today');
  });

  it('rejects action with negative CO2', async () => {
    const action: ActionItem = {
      id: generateId(), userId: 'user1', category: 'transport',
      title: 'Bad action', description: 'Negative', co2SavingKg: -1,
      completed: false, completedAt: null,
    };
    await expect(saveAction(action)).rejects.toThrow();
  });

  it('rejects action without title', async () => {
    const action: ActionItem = {
      id: generateId(), userId: 'user1', category: 'transport',
      title: '', description: 'No title', co2SavingKg: 1,
      completed: false, completedAt: null,
    };
    await expect(saveAction(action)).rejects.toThrow();
  });
});

describe('Badge storage', () => {
  it('returns default badges for new user', async () => {
    const user = await createUser('badge@example.com', 'password123', 'Badge Test', 'US', 'NY');
    const badges = await getBadges(user.id);
    expect(badges.length).toBe(4);
    badges.forEach(b => expect(b.earned).toBe(false));
  });

  it('saves and retrieves badges', async () => {
    const user = await createUser('badgesave@example.com', 'password123', 'Badge Save', 'US', 'NY');
    const badges = await getBadges(user.id);
    badges[0].earned = true;
    badges[0].earnedAt = Date.now();
    await saveBadges(user.id, badges);
    const fetched = await getBadges(user.id);
    expect(fetched[0].earned).toBe(true);
  });
});

describe('Eco Points storage', () => {
  it('defaults to 0', async () => {
    const user = await createUser('points@example.com', 'password123', 'Points Test', 'US', 'NY');
    const points = await getEcoPoints(user.id);
    expect(points).toBe(0);
  });

  it('saves and retrieves points', async () => {
    const user = await createUser('pointsave@example.com', 'password123', 'Point Save', 'US', 'NY');
    await saveEcoPoints(user.id, 500);
    const points = await getEcoPoints(user.id);
    expect(points).toBe(500);
  });
});

describe('Streak storage', () => {
  it('defaults to 0', async () => {
    const user = await createUser('streak@example.com', 'password123', 'Streak Test', 'US', 'NY');
    const streak = await getStreak(user.id);
    expect(streak).toBe(0);
  });

  it('saves and retrieves streak', async () => {
    const user = await createUser('streaksave@example.com', 'password123', 'Streak Save', 'US', 'NY');
    await saveStreak(user.id, 5, Date.now());
    const streak = await getStreak(user.id);
    expect(streak).toBe(5);
  });
});
