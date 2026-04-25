import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/src/utils/storage';
import type { TimerState, SessionType, FocusSession, PomodoroSettings } from '@/src/types';

interface FocusState {
  // Timer
  timerState: TimerState;
  sessionType: SessionType;
  timeRemaining: number; // seconds
  sessionsCompleted: number;
  currentTaskId: string | null;

  // Settings (from store for independent access)
  settings: PomodoroSettings;

  // History
  sessions: FocusSession[];
  todayFocusMinutes: number;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => boolean; // returns true if session completed
  setCurrentTask: (taskId: string | null) => void;
  completeSession: () => void;
  skipToNext: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  getTodayFocusMinutes: () => number;
  getWeeklyFocusData: () => { day: string; minutes: number }[];
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

const getDurationForType = (type: SessionType, settings: PomodoroSettings): number => {
  switch (type) {
    case 'work': return settings.workDuration * 60;
    case 'shortBreak': return settings.shortBreakDuration * 60;
    case 'longBreak': return settings.longBreakDuration * 60;
  }
};

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      timerState: 'idle',
      sessionType: 'work',
      timeRemaining: defaultSettings.workDuration * 60,
      sessionsCompleted: 0,
      currentTaskId: null,
      settings: defaultSettings,
      sessions: [],
      todayFocusMinutes: 0,

      startTimer: () => set({ timerState: 'running' }),
      pauseTimer: () => set({ timerState: 'paused' }),

      resetTimer: () => {
        const { sessionType, settings } = get();
        set({
          timerState: 'idle',
          timeRemaining: getDurationForType(sessionType, settings),
        });
      },

      tick: () => {
        const { timeRemaining } = get();
        if (timeRemaining <= 1) {
          get().completeSession();
          return true;
        }
        set({ timeRemaining: timeRemaining - 1 });
        return false;
      },

      setCurrentTask: (taskId) => set({ currentTaskId: taskId }),

      completeSession: () => {
        const { sessionType, sessionsCompleted, settings, sessions, currentTaskId } = get();

        // Record session
        if (sessionType === 'work') {
          const session: FocusSession = {
            id: `${Date.now()}`,
            taskId: currentTaskId || undefined,
            type: 'work',
            duration: settings.workDuration * 60,
            completedAt: new Date().toISOString(),
          };

          const newSessionsCompleted = sessionsCompleted + 1;
          const isLongBreak = newSessionsCompleted % settings.sessionsBeforeLongBreak === 0;
          const nextType: SessionType = isLongBreak ? 'longBreak' : 'shortBreak';

          set({
            timerState: 'idle',
            sessionType: nextType,
            timeRemaining: getDurationForType(nextType, settings),
            sessionsCompleted: newSessionsCompleted,
            sessions: [...sessions, session],
          });
        } else {
          set({
            timerState: 'idle',
            sessionType: 'work',
            timeRemaining: getDurationForType('work', settings),
          });
        }
      },

      skipToNext: () => {
        const { sessionType, sessionsCompleted, settings } = get();
        if (sessionType === 'work') {
          const isLongBreak = (sessionsCompleted + 1) % settings.sessionsBeforeLongBreak === 0;
          const nextType: SessionType = isLongBreak ? 'longBreak' : 'shortBreak';
          set({
            timerState: 'idle',
            sessionType: nextType,
            timeRemaining: getDurationForType(nextType, settings),
            sessionsCompleted: sessionsCompleted + 1,
          });
        } else {
          set({
            timerState: 'idle',
            sessionType: 'work',
            timeRemaining: getDurationForType('work', settings),
          });
        }
      },

      updateSettings: (updates) => {
        const newSettings = { ...get().settings, ...updates };
        set({
          settings: newSettings,
          timeRemaining: getDurationForType(get().sessionType, newSettings),
        });
      },

      getTodayFocusMinutes: () => {
        const { sessions, sessionType, settings, timeRemaining } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let totalMinutes = sessions.filter(
          (s) => s.type === 'work' && new Date(s.completedAt) >= today
        ).reduce((sum, s) => sum + s.duration / 60, 0);

        // Add current session's elapsed time if it's work time
        if (sessionType === 'work') {
          const elapsedSeconds = (settings.workDuration * 60) - timeRemaining;
          totalMinutes += elapsedSeconds / 60;
        }

        return totalMinutes;
      },

      getWeeklyFocusData: () => {
        const { sessions, sessionType, settings, timeRemaining } = get();
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const now = new Date();
        
        // Find Monday of the current week
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay(); // 0 is Sunday
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        return days.map((day, i) => {
          const dayStart = new Date(startOfWeek);
          dayStart.setDate(startOfWeek.getDate() + i);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayStart.getDate() + 1);

          let minutes = sessions.filter((s) => {
            const d = new Date(s.completedAt);
            return s.type === 'work' && d >= dayStart && d < dayEnd;
          }).reduce((sum, s) => sum + s.duration / 60, 0);

          // If this is today and we are in a work session, add the elapsed time
          const isToday = now >= dayStart && now < dayEnd;
          if (isToday && sessionType === 'work') {
            const elapsedSeconds = (settings.workDuration * 60) - timeRemaining;
            minutes += elapsedSeconds / 60;
          }

          return { day, minutes };
        });
      },
    }),
    {
      name: 'tasky-focus',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        sessionsCompleted: state.sessionsCompleted,
        settings: state.settings,
      }),
    }
  )
);
