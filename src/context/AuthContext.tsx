import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LocaleConfig, EmissionBreakdown } from '../types';
import { createUser, authenticateUser, getUserById, seedMockUsers, getQuizAnswers, getEcoPoints, getStreak, saveEcoPoints, checkAndAwardBadges } from '../db/database';
import { getLocale } from '../utils/locale';

interface AuthContextType {
  user: User | null;
  locale: LocaleConfig | null;
  quizCompleted: boolean;
  baselineEmissions: EmissionBreakdown | null;
  ecoPoints: number;
  streak: number;
  badges: Badge[];
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string, name: string, country: string, city: string) => Promise<User | null>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  addPoints: (pts: number) => Promise<void>;
}

import { Badge } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [locale, setLocale] = useState<LocaleConfig | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [baselineEmissions, setBaselineEmissions] = useState<EmissionBreakdown | null>(null);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);

  const refreshUserData = useCallback(async () => {
    if (!user) return;
    const quizData = await getQuizAnswers(user.id);
    const points = await getEcoPoints(user.id);
    const streakVal = await getStreak(user.id);
    const badgeData = await checkAndAwardBadges(user.id);
    setQuizCompleted(!!quizData);
    setBaselineEmissions(quizData?.emissions ?? null);
    setEcoPoints(points);
    setStreak(streakVal);
    setBadges(badgeData);
  }, [user]);

  useEffect(() => {
    seedMockUsers().then(() => {
      const stored = localStorage.getItem('cf_current_user');
      if (stored) {
        getUserById(JSON.parse(stored).id).then(u => {
          if (u) { setUser(u); setLocale(getLocale(u.country)); }
        });
      }
    });
  }, []);

  useEffect(() => {
    if (user) { setLocale(getLocale(user.country)); refreshUserData(); }
  }, [user, refreshUserData]);

  const login = async (email: string, password: string): Promise<User | null> => {
    const u = await authenticateUser(email, password);
    if (u) { setUser(u); localStorage.setItem('cf_current_user', JSON.stringify({ id: u.id })); return u; }
    return null;
  };

  const signup = async (email: string, password: string, name: string, country: string, city: string): Promise<User | null> => {
    try {
      const u = await createUser(email, password, name, country as User['country'], city);
      setUser(u); localStorage.setItem('cf_current_user', JSON.stringify({ id: u.id })); return u;
    } catch { return null; }
  };

  const logout = () => { setUser(null); setLocale(null); setQuizCompleted(false); setBaselineEmissions(null); setEcoPoints(0); setStreak(0); localStorage.removeItem('cf_current_user'); };

  const addPoints = async (pts: number) => {
    if (!user) return;
    const newPoints = ecoPoints + pts;
    await saveEcoPoints(user.id, newPoints);
    setEcoPoints(newPoints);
    const updatedBadges = await checkAndAwardBadges(user.id);
    setBadges(updatedBadges);
  };

  return (
    <AuthContext.Provider value={{ user, locale, quizCompleted, baselineEmissions, ecoPoints, streak, badges, login, signup, logout, refreshUserData, addPoints }}>
      {children}
    </AuthContext.Provider>
  );
}
