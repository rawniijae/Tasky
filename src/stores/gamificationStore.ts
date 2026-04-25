import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/src/utils/storage';
import type { GamificationState, Achievement, Priority } from '@/src/types';
import { formatDateForStore } from '@/src/utils/dates';

// ─── XP Config ───────────────────────────────────────────────
const XP_PER_TASK: Record<Priority, number> = {
  p1: 50,
  p2: 35,
  p3: 20,
  p4: 10,
};
const XP_PER_FOCUS_SESSION = 25;
const STREAK_BONUS_XP = 15;

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000,
  6500, 8000, 10000, 12500, 15000, 18000, 22000, 27000, 33000,
];

function getLevelForXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function getXPForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 5000;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_task', title: 'First Steps', description: 'Complete your first task', icon: '🎯', requirement: 1 },
  { id: 'ten_tasks', title: 'Getting Things Done', description: 'Complete 10 tasks', icon: '⚡', requirement: 10 },
  { id: 'fifty_tasks', title: 'Productivity Pro', description: 'Complete 50 tasks', icon: '🏆', requirement: 50 },
  { id: 'hundred_tasks', title: 'Centurion', description: 'Complete 100 tasks', icon: '💯', requirement: 100 },
  { id: 'streak_3', title: 'Hat Trick', description: '3-day streak', icon: '🔥', requirement: 3 },
  { id: 'streak_7', title: 'Week Warrior', description: '7-day streak', icon: '🗓️', requirement: 7 },
  { id: 'streak_30', title: 'Monthly Master', description: '30-day streak', icon: '👑', requirement: 30 },
  { id: 'focus_10', title: 'Focus Initiate', description: '10 focus minutes', icon: '🧘', requirement: 10 },
  { id: 'focus_60', title: 'Deep Worker', description: '60 focus minutes', icon: '🧠', requirement: 60 },
  { id: 'focus_300', title: 'Flow State Master', description: '300 focus minutes', icon: '🌊', requirement: 300 },
];

interface GamificationStore extends GamificationState {
  addXPForTask: (priority: Priority) => { xpGained: number; leveledUp: boolean };
  addXPForFocus: (minutes: number) => void;
  updateStreak: () => void;
  checkAchievements: () => Achievement | null;
  getProgressToNextLevel: () => number;
  getXPForNextLevel: () => number;
}

const initialState: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  totalTasksCompleted: 0,
  totalFocusMinutes: 0,
  dailyCompletions: {},
  achievements: DEFAULT_ACHIEVEMENTS,
};

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXPForTask: (priority) => {
        const state = get();
        const baseXP = XP_PER_TASK[priority];
        const streakBonus = state.streak > 0 ? STREAK_BONUS_XP : 0;
        const xpGained = baseXP + streakBonus;
        const newXP = state.xp + xpGained;
        const newLevel = getLevelForXP(newXP);
        const leveledUp = newLevel > state.level;

        const today = formatDateForStore(new Date());
        const dailyCompletions = { ...state.dailyCompletions };
        dailyCompletions[today] = (dailyCompletions[today] || 0) + 1;

        set({
          xp: newXP,
          level: newLevel,
          totalTasksCompleted: state.totalTasksCompleted + 1,
          dailyCompletions,
        });

        return { xpGained, leveledUp };
      },

      addXPForFocus: (minutes) => {
        const state = get();
        const xpGained = XP_PER_FOCUS_SESSION;
        const newXP = state.xp + xpGained;
        set({
          xp: newXP,
          level: getLevelForXP(newXP),
          totalFocusMinutes: state.totalFocusMinutes + minutes,
        });
      },

      updateStreak: () => {
        const state = get();
        const today = formatDateForStore(new Date());
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDateForStore(yesterday);

        if (state.lastCompletionDate === today) return; // Already updated today

        let newStreak = 1;
        if (state.lastCompletionDate === yesterdayStr) {
          newStreak = state.streak + 1;
        }

        set({
          streak: newStreak,
          longestStreak: Math.max(newStreak, state.longestStreak),
          lastCompletionDate: today,
        });
      },

      checkAchievements: () => {
        const state = get();
        const updated = [...state.achievements];
        let newlyUnlocked: Achievement | null = null;

        for (let i = 0; i < updated.length; i++) {
          const a = updated[i];
          if (a.unlockedAt) continue;

          let value = 0;
          if (a.id.startsWith('first_task') || a.id.includes('_tasks')) {
            value = state.totalTasksCompleted;
          } else if (a.id.startsWith('streak_')) {
            value = state.streak;
          } else if (a.id.startsWith('focus_')) {
            value = state.totalFocusMinutes;
          }

          if (value >= a.requirement) {
            updated[i] = { ...a, unlockedAt: new Date().toISOString() };
            newlyUnlocked = updated[i];
          }
        }

        if (newlyUnlocked) {
          set({ achievements: updated });
        }
        return newlyUnlocked;
      },

      getProgressToNextLevel: () => {
        const { xp, level } = get();
        const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
        const nextLevelXP = getXPForNextLevel(level);
        const progress = (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
        return Math.max(0, Math.min(1, progress));
      },

      getXPForNextLevel: () => {
        return getXPForNextLevel(get().level);
      },
    }),
    {
      name: 'tasky-gamification',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
