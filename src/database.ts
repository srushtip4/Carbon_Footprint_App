import { User, QuizAnswers, EmissionBreakdown, WeeklyCheckin, ActionItem, Badge, LeaderboardEntry, Country } from '../types';
import { getLocale } from '../utils/locale';
import { calculateEmissions, getGardenLevel, getReductionPct } from '../utils/emissions';

const DB_NAME = 'carbonFootprintDB';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('email', 'email', { unique: true });
      }
      if (!db.objectStoreNames.contains('quizAnswers')) {
        db.createObjectStore('quizAnswers', { keyPath: 'userId' });
      }
      if (!db.objectStoreNames.contains('checkins')) {
        const store = db.createObjectStore('checkins', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
      }
      if (!db.objectStoreNames.contains('actions')) {
        const store = db.createObjectStore('actions', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
      }
      if (!db.objectStoreNames.contains('badges')) {
        db.createObjectStore('badges', { keyPath: 'userId' });
      }
      if (!db.objectStoreNames.contains('ecopoints')) {
        db.createObjectStore('ecopoints', { keyPath: 'userId' });
      }
      if (!db.objectStoreNames.contains('streaks')) {
        db.createObjectStore('streaks', { keyPath: 'userId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function simpleHash(str: string): Promise<string> {
  const data = new TextEncoder().encode(str + 'carbon_salt_2024');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ---- USER ----
export async function createUser(email: string, password: string, name: string, country: Country, city: string): Promise<User> {
  const db = await openDB();
  const hash = await simpleHash(password);
  const user: User = { id: generateId(), email, passwordHash: hash, name, country, city, createdAt: Date.now() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    const req = tx.objectStore('users').add(user);
    req.onsuccess = () => resolve(user);
    req.onerror = () => reject(req.error);
  });
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const db = await openDB();
  const hash = await simpleHash(password);
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const req = tx.objectStore('users').index('email').get(email);
    req.onsuccess = () => {
      const user = req.result as User | undefined;
      if (user && user.passwordHash === hash) resolve(user);
      else resolve(null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('users', 'readonly').objectStore('users').get(id);
    req.onsuccess = () => resolve((req.result as User) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllUsers(): Promise<User[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('users', 'readonly').objectStore('users').getAll();
    req.onsuccess = () => resolve(req.result as User[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('users', 'readonly').objectStore('users').index('email').get(email);
    req.onsuccess = () => resolve((req.result as User) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function resetUserPassword(email: string, newPassword: string): Promise<boolean> {
  const db = await openDB();
  const user = await getUserByEmail(email);
  if (!user) return false;
  const hash = await simpleHash(newPassword);
  const updated: User = { ...user, passwordHash: hash };
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    tx.objectStore('users').put(updated);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// ---- QUIZ ----
export async function saveQuizAnswers(userId: string, answers: QuizAnswers, emissions: EmissionBreakdown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('quizAnswers', 'readwrite');
    tx.objectStore('quizAnswers').put({ userId, answers, emissions, completedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQuizAnswers(userId: string): Promise<{ answers: QuizAnswers; emissions: EmissionBreakdown } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('quizAnswers', 'readonly').objectStore('quizAnswers').get(userId);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

// ---- CHECKINS ----
export async function saveCheckin(checkin: WeeklyCheckin): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('checkins', 'readwrite');
    tx.objectStore('checkins').add(checkin);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCheckins(userId: string): Promise<WeeklyCheckin[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('checkins', 'readonly').objectStore('checkins').index('userId').getAll(userId);
    req.onsuccess = () => resolve((req.result as WeeklyCheckin[]).sort((a, b) => a.checkinDate - b.checkinDate));
    req.onerror = () => reject(req.error);
  });
}

// ---- ACTIONS ----
export async function saveAction(action: ActionItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('actions', 'readwrite');
    tx.objectStore('actions').put(action);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getActions(userId: string): Promise<ActionItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('actions', 'readonly').objectStore('actions').index('userId').getAll(userId);
    req.onsuccess = () => resolve(req.result as ActionItem[]);
    req.onerror = () => reject(req.error);
  });
}

// ---- BADGES ----
const DEFAULT_BADGES: Badge[] = [
  { id: 'bronze', name: 'Bronze', description: 'Complete the initial quiz', earned: false, earnedAt: null },
  { id: 'silver', name: 'Silver', description: '500 Eco-Points + 3-week streak', earned: false, earnedAt: null },
  { id: 'gold', name: 'Gold', description: '1500 Eco-Points + 15% reduction', earned: false, earnedAt: null },
  { id: 'platinum', name: 'Platinum', description: 'Top 100 lowest footprint globally', earned: false, earnedAt: null },
];

export async function getBadges(userId: string): Promise<Badge[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('badges', 'readonly').objectStore('badges').get(userId);
    req.onsuccess = () => {
      if (req.result) resolve((req.result as { userId: string; badges: Badge[] }).badges);
      else resolve(DEFAULT_BADGES.map(b => ({ ...b })));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveBadges(userId: string, badges: Badge[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('badges', 'readwrite');
    tx.objectStore('badges').put({ userId, badges });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---- ECO POINTS ----
export async function getEcoPoints(userId: string): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('ecopoints', 'readonly').objectStore('ecopoints').get(userId);
    req.onsuccess = () => resolve(req.result ? (req.result as { userId: string; points: number }).points : 0);
    req.onerror = () => reject(req.error);
  });
}

export async function saveEcoPoints(userId: string, points: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('ecopoints', 'readwrite');
    tx.objectStore('ecopoints').put({ userId, points });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---- STREAKS ----
export async function getStreak(userId: string): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('streaks', 'readonly').objectStore('streaks').get(userId);
    req.onsuccess = () => resolve(req.result ? (req.result as { userId: string; streak: number }).streak : 0);
    req.onerror = () => reject(req.error);
  });
}

export async function saveStreak(userId: string, streak: number, lastCheckin: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('streaks', 'readwrite');
    tx.objectStore('streaks').put({ userId, streak, lastCheckin });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---- SEED DATA ----
const MOCK_NAMES = [
  'Aarav Sharma','Priya Patel','Liam O\'Brien','Emma Watson','Hans Mueller','Sofia Garcia','Marco Rossi',
  'Yuki Tanaka','Chen Wei','Fatima Al-Rashid','Olivia Bennett','Lucas Fernandez','Aisha Khan','Rajesh Gupta',
  'Marta Silva','Erik Johansson','Ingrid Larsen','Pierre Dubois','Nina Petrov','Ahmed Hassan','Sarah Johnson',
  'David Kim','Mei Lin','Carlos Rodriguez','Anna Kowalski','James Thompson','Maria Santos','Roberto Bianchi',
  'Elena Popescu','Viktor Kozlov','Sophie Martin','Thomas Weber','Isabella Costa','Kenji Yamamoto','Lakshmi Iyer',
  'Michael O\'Neill','Camille Rousseau','Sven Andersson','Katarina Novak','Omar Farouk','Jennifer Lee',
  'Daniel Schmidt','Amara Diallo','Ravi Nair','Chloe Dupont','Nathan Brown','Sakura Hayashi','Diego Morales',
  'Anya Volkov','Kwame Asante','Grace Williams','Alejandro Ruiz','Sunita Devi','Hiroshi Sato','Zara Mohammed',
  'Robert Taylor','Julia Becker','Rashmi Rao','Andrey Sokolov','Alessia Ferrari','Chris Evans','Natasha Ivanova',
  'Miguel Torres','Leila Benali','Arjun Reddy','Samantha Davis','Felix Schneider','Padma Krishnan',
  'Ludvig Holm','Fatou Diop','Benjamin Harris','Eva Lindgren','Kiran Bhat','Paulina Maj','Dmitri Volkov',
  'Amanda Wilson','Stefan Richter','Neeta Joshi','Ingrid Haugen','Yolanda Reyes','Matthew Anderson',
  'Claudia Hoffman','Sunil Parekh','Brigitta Kovacs','Naoki Ishikawa','Rachel Moore','Heinrich Fischer',
  'Anjali Das','Esko Virtanen','Mariama Toure','Andrew White','Laura Becker','Vivek Singh','Signe Nielsen',
  'Ronaldo Lima','Stephanie Hill','Karl Wagner','Pooja Agarwal','Astrid Berg','Takeshi Morimoto',
  'Joshua Green','Sabine Koch','Rohit Verma','Freya Johansson','Cristina Barbosa','Daniel Mitchell',
  'Petra Van Berg','Sanjay Kumar','Hanna Olsen','Arturo Vega','Catherine Hall','Guenther Muller','Simran Kaur',
  'Lena Strand','Fernando Herrera','Ryan Baker','Margot Fontaine','Amit Shah','Elina Saarinen','Isabel Montoya',
  'Steven Young','Renate Schaefer','Nisha Pillai','Kjersti Lund','Victor Ramos','Megan Allen','Werner Hartmann',
  'Prakash Deshmukh','Annette Larsen','Eduardo Costa','Timothy Scott','Bianca Lang','Rekha Sharma',
  'Liv Dahlgren','Joaquin Ortega','Rebecca King','Clemens Berg','Tara Sengupta','Maja Lindqvist','Paolo Marchetti',
  'Jason Wright','Helga Braun','Usha Iyengar','Solveig Ruud','Rafael Gutierrez','Sandra Turner','Friedrich Kruger',
  'Anita Ranganathan','Turid Holm','Giovanni Colombo','Patrick Campbell','Gertrude Klein','Dilip Chauhan',
  'Viveka Nyman','Alejandra Vega',
];

const MOCK_COUNTRIES: Country[] = ['US','India','UK','Germany','France','Spain','Italy','Netherlands','Sweden','Norway'];

const CITY_MAP: Record<Country, string[]> = {
  US: ['New York','Los Angeles','Chicago','Houston','Phoenix','San Francisco','Seattle','Denver'],
  India: ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Jaipur'],
  UK: ['London','Manchester','Birmingham','Edinburgh','Bristol','Leeds','Glasgow','Cardiff'],
  Germany: ['Berlin','Munich','Hamburg','Frankfurt','Cologne','Stuttgart','Dresden','Leipzig'],
  France: ['Paris','Lyon','Marseille','Toulouse','Nice','Nantes','Strasbourg','Bordeaux'],
  Spain: ['Madrid','Barcelona','Valencia','Seville','Bilbao','Malaga','Zaragoza','Granada'],
  Italy: ['Rome','Milan','Naples','Florence','Venice','Turin','Bologna','Palermo'],
  Netherlands: ['Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven','Groningen','Maastricht','Leiden'],
  Sweden: ['Stockholm','Gothenburg','Malmo','Uppsala','Linkoping','Lund','Umea','Orebro'],
  Norway: ['Oslo','Bergen','Stavanger','Trondheim','Tromso','Drammen','Kristiansand','Bodo'],
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockQuizAnswers(): QuizAnswers {
  return {
    q1_transport_mode: randomInt(0,5), q2_weekly_distance: randomInt(10,300),
    q3_public_transit_hours: randomInt(0,15), q4_rideshare_frequency: randomInt(0,3),
    q5_short_flights: randomInt(0,10), q6_long_flights: randomInt(0,5),
    q7_electricity_bill: randomInt(20,300), q8_heating_fuel: randomInt(0,3),
    q9_renewable_pct: [0,25,50,100][randomInt(0,3)], q10_diet: randomInt(0,4),
    q11_local_food: randomInt(0,2), q12_food_waste: randomInt(0,2),
    q13_garbage_bags: randomInt(1,5), q14_recycling: randomInt(0,2), q15_shopping: randomInt(0,2),
  };
}

let seeded = false;

export async function seedMockUsers(): Promise<void> {
  if (seeded) return;
  const existing = await getAllUsers();
  if (existing.length > 0) { seeded = true; return; }

  for (let i = 0; i < 150; i++) {
    const country = MOCK_COUNTRIES[i % MOCK_COUNTRIES.length];
    const cities = CITY_MAP[country];
    const city = cities[i % cities.length];
    const name = MOCK_NAMES[i % MOCK_NAMES.length];
    const id = `mock_${i + 1}`;

    const user: User = { id, email: `mock${i+1}@example.com`, passwordHash: '', name, country, city, createdAt: Date.now() - randomInt(30,365)*86400000 };
    const locale = getLocale(country);
    const answers = generateMockQuizAnswers();
    const emissions = calculateEmissions(answers, locale);

    try {
      const db = await openDB();
      const tx1 = db.transaction('users', 'readwrite');
      tx1.objectStore('users').add(user);
      await new Promise<void>((res, rej) => { tx1.oncomplete = () => res(); tx1.onerror = () => rej(tx1.error); });

      await saveQuizAnswers(id, answers, emissions);

      const numCheckins = randomInt(1,8);
      for (let c = 0; c < numCheckins; c++) {
        const reduction = randomInt(-5,30);
        const totalNet = Math.round(emissions.total * (1 - reduction / 100));
        const gardenLevel = getGardenLevel(Math.max(0, reduction));
        await saveCheckin({
          id: `mock_${i+1}_checkin_${c}`, userId: id,
          checkinDate: Date.now() - (numCheckins - c) * 604800000,
          transportEmissions: Math.round(emissions.transport * (1 - randomInt(0,20)/100)),
          energyEmissions: Math.round(emissions.energy * (1 - randomInt(0,15)/100)),
          foodEmissions: Math.round(emissions.food * (1 - randomInt(0,10)/100)),
          wasteEmissions: Math.round(emissions.waste * (1 - randomInt(0,15)/100)),
          totalNetEmissions: totalNet, gardenStateLevel: gardenLevel,
        });
      }

      const points = randomInt(50, 2500);
      await saveEcoPoints(id, points);
      await saveStreak(id, randomInt(1,12), Date.now() - randomInt(0,13)*86400000);

      const badges = DEFAULT_BADGES.map(b => ({ ...b }));
      if (i < 100) { badges[0].earned = true; badges[0].earnedAt = user.createdAt; }
      if (points >= 500) { badges[1].earned = true; badges[1].earnedAt = user.createdAt + 86400000*21; }
      if (points >= 1500) { badges[2].earned = true; badges[2].earnedAt = user.createdAt + 86400000*60; }
      await saveBadges(id, badges);
    } catch { /* skip duplicates */ }
  }
  seeded = true;
}

export async function getLeaderboard(_currentUserId: string): Promise<LeaderboardEntry[]> {
  const users = await getAllUsers();
  const entries: { userId: string; name: string; country: Country; city: string; netFootprint: number; ecoPoints: number; streak: number; badges: Badge[] }[] = [];

  for (const user of users) {
    const quizData = await getQuizAnswers(user.id);
    if (!quizData) continue;
    const points = await getEcoPoints(user.id);
    const streakVal = await getStreak(user.id);
    const badgeData = await getBadges(user.id);
    const checkins = await getCheckins(user.id);
    const latestTotal = checkins.length > 0 ? checkins[checkins.length-1].totalNetEmissions : quizData.emissions.total;
    entries.push({ userId: user.id, name: user.name, country: user.country, city: user.city, netFootprint: latestTotal, ecoPoints: points, streak: streakVal, badges: badgeData });
  }

  entries.sort((a, b) => a.netFootprint - b.netFootprint);
  return entries.map((e, idx) => ({ ...e, rank: idx + 1 }));
}

export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const badges = await getBadges(userId);
  const points = await getEcoPoints(userId);
  const streakVal = await getStreak(userId);
  const quizData = await getQuizAnswers(userId);

  if (quizData && !badges[0].earned) { badges[0].earned = true; badges[0].earnedAt = Date.now(); }
  if (points >= 500 && streakVal >= 3 && !badges[1].earned) { badges[1].earned = true; badges[1].earnedAt = Date.now(); }
  if (quizData && points >= 1500 && !badges[2].earned) {
    const checkins = await getCheckins(userId);
    const currentTotal = checkins.length > 0 ? checkins[checkins.length-1].totalNetEmissions : quizData.emissions.total;
    if (getReductionPct(quizData.emissions.total, currentTotal) >= 15) { badges[2].earned = true; badges[2].earnedAt = Date.now(); }
  }
  if (!badges[3].earned) {
    const lb = await getLeaderboard(userId);
    const userEntry = lb.find(e => e.userId === userId);
    if (userEntry && userEntry.rank <= 100) { badges[3].earned = true; badges[3].earnedAt = Date.now(); }
  }

  await saveBadges(userId, badges);
  return badges;
}
