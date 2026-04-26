import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/src/utils/storage';
import type { TimerState, SessionType, FocusSession, PomodoroSettings } from '@/src/types';

interface FocusState {
  // Timer
  timerState: TimerState;
  sessionType: SessionType;
  timeRemaining: number; // seconds
  expectedEndTime: number | null; // timestamp when session should end
  sessionsCompleted: number;
  currentTaskId: string | null;

  // Settings
  settings: PomodoroSettings;

  // History
  sessions: FocusSession[];

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => boolean; // returns true if session completed
  syncTime: () => boolean; // syncs timeRemaining based on expectedEndTime
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
      expectedEndTime: null,
      sessionsCompleted: 0,
      currentTaskId: null,
      settings: defaultSettings,
      sessions: [],

      startTimer: () => {
        const { timeRemaining } = get();
        set({ 
          timerState: 'running',
          expectedEndTime: Date.now() + (timeRemaining * 1000)
        });
      },

      pauseTimer: () => {
        // Recalculate timeRemaining one last time before pausing
        get().syncTime();
        set({ 
          timerState: 'paused',
          expectedEndTime: null
        });
      },

      resetTimer: () => {
        const { sessionType, settings } = get();
        set({
          timerState: 'idle',
          expectedEndTime: null,
          timeRemaining: getDurationForType(sessionType, settings),
        });
      },

      syncTime: () => {
        const { timerState, expectedEndTime } = get();
        if (timerState !== 'running' || !expectedEndTime) return false;

        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((expectedEndTime - now) / 1000));
        
        if (remaining <= 0) {
          get().completeSession();
          return true;
        }
        
        set({ timeRemaining: remaining });
        return false;
      },

      tick: () => {
        return get().syncTime();
      },

      setCurrentTask: (taskId) => set({ currentTaskId: taskId }),

      completeSession: () => {
        const { sessionType, sessionsCompleted, settings, sessions, currentTaskId } = get();

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
            expectedEndTime: null,
            sessionType: nextType,
            timeRemaining: getDurationForType(nextType, settings),
            sessionsCompleted: newSessionsCompleted,
            sessions: [...sessions, session],
          });
        } else {
          set({
            timerState: 'idle',
            expectedEndTime: null,
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
            expectedEndTime: null,
            sessionType: nextType,
            timeRemaining: getDurationForType(nextType, settings),
            sessionsCompleted: sessionsCompleted + 1,
          });
        } else {
          set({
            timerState: 'idle',
            expectedEndTime: null,
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
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        
        // Sum of completed work sessions today
        let totalMinutes = sessions.filter(
          (s) => s.type === 'work' && new Date(s.completedAt).getTime() >= startOfToday
        ).reduce((sum, s) => sum + s.duration / 60, 0);

        // Add current session's elapsed time ONLY if it's work time
        if (sessionType === 'work') {
          const elapsedSeconds = (settings.workDuration * 60) - timeRemaining;
          // Only add full seconds, don't round up prematurely
          totalMinutes += Math.max(0, elapsedSeconds) / 60;
        }

        return totalMinutes;
      },

      getWeeklyFocusData: () => {
        const { sessions, sessionType, settings, timeRemaining } = get();
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const now = new Date();
        
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
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

          const isToday = now.getTime() >= dayStart.getTime() && now.getTime() < dayEnd.getTime();
          if (isToday && sessionType === 'work') {
            const elapsedSeconds = (settings.workDuration * 60) - timeRemaining;
            minutes += Math.max(0, elapsedSeconds) / 60;
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
        expectedEndTime: state.expectedEndTime,
        timerState: state.timerState === 'running' ? 'running' : state.timerState,
        timeRemaining: state.timeRemaining,
        sessionType: state.sessionType,
      }),
    }
  )
);
