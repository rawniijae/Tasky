import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/src/utils/storage';
import type { AppSettings, ThemeMode, CategoryId, Priority, SortBy } from '@/src/types';
import type { ThemeFlavor } from '@/src/theme/themes';
import Constants from 'expo-constants';

const defaultSettings: AppSettings = {
  theme: 'system',
  themeFlavor: 'default',
  hapticEnabled: true,
  notificationsEnabled: true,
  defaultCategory: 'personal',
  defaultPriority: 'p3',
  sortBy: 'priority',
  showCompletedTasks: true,
  pomodoro: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  },
};

interface SettingsState {
  settings: AppSettings;
  currentVersion: string;
  lastSeenUpdateId: string;

  
  setTheme: (theme: ThemeMode) => void;
  setThemeFlavor: (flavor: ThemeFlavor) => void;
  toggleHaptic: () => void;
  toggleNotifications: () => void;
  setDefaultCategory: (cat: CategoryId) => void;
  setDefaultPriority: (p: Priority) => void;
  setSortBy: (s: SortBy) => void;
  toggleShowCompleted: () => void;
  updatePomodoroSettings: (settings: Partial<AppSettings['pomodoro']>) => void;
  setLastSeenUpdateId: (id: string) => void;
  resetSettings: () => void;
}


export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      currentVersion: Constants.expoConfig?.version || '1.1.0',
      lastSeenUpdateId: '',

      setTheme: (theme) =>
        set((state) => ({ settings: { ...state.settings, theme } })),
      setThemeFlavor: (themeFlavor) =>
        set((state) => ({ settings: { ...state.settings, themeFlavor } })),
      toggleHaptic: () =>
        set((state) => ({
          settings: { ...state.settings, hapticEnabled: !state.settings.hapticEnabled },
        })),
      toggleNotifications: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            notificationsEnabled: !state.settings.notificationsEnabled,
          },
        })),
      setDefaultCategory: (cat) =>
        set((state) => ({ settings: { ...state.settings, defaultCategory: cat } })),
      setDefaultPriority: (p) =>
        set((state) => ({ settings: { ...state.settings, defaultPriority: p } })),
      setSortBy: (s) =>
        set((state) => ({ settings: { ...state.settings, sortBy: s } })),
      toggleShowCompleted: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            showCompletedTasks: !state.settings.showCompletedTasks,
          },
        })),
      updatePomodoroSettings: (pomodoroUpdates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            pomodoro: { ...state.settings.pomodoro, ...pomodoroUpdates },
          },
        })),
      setLastSeenUpdateId: (id) => set({ lastSeenUpdateId: id }),
      resetSettings: () => set({ settings: defaultSettings, lastSeenUpdateId: '' }),
    }),

    {
      name: 'tasky-settings',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

