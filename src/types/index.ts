// ─── Priority ────────────────────────────────────────────────
export type Priority = 'p1' | 'p2' | 'p3' | 'p4';

export const PRIORITY_LABELS: Record<Priority, string> = {
  p1: 'Urgent',
  p2: 'High',
  p3: 'Medium',
  p4: 'Low',
};

// ─── Category ────────────────────────────────────────────────
export type CategoryId = 'work' | 'personal' | 'study' | 'health' | 'finance' | 'shopping' | 'other';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string; // Ionicons name
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'work', label: 'Work', icon: 'briefcase', color: '#6366F1' },
  { id: 'personal', label: 'Personal', icon: 'person', color: '#F59E0B' },
  { id: 'study', label: 'Study', icon: 'book', color: '#3B82F6' },
  { id: 'health', label: 'Health', icon: 'fitness', color: '#10B981' },
  { id: 'finance', label: 'Finance', icon: 'wallet', color: '#8B5CF6' },
  { id: 'shopping', label: 'Shopping', icon: 'cart', color: '#EC4899' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

// ─── Recurrence ──────────────────────────────────────────────
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number; // every N days/weeks/months
  daysOfWeek?: number[]; // 0=Sun..6=Sat for weekly
}

// ─── Subtask ─────────────────────────────────────────────────
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

// ─── Task ────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: CategoryId;
  completed: boolean;
  completedAt?: string; // ISO date
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  dueDate?: string; // ISO date
  dueTime?: string; // HH:mm
  subtasks: Subtask[];
  recurrence: RecurrenceRule;
  reminderMinutes?: number; // minutes before due date
  order: number; // for manual sorting
  notificationIds?: string[];
}

// ─── Sort & Filter ───────────────────────────────────────────
export type SortBy = 'priority' | 'dueDate' | 'createdAt' | 'manual';
export type FilterStatus = 'all' | 'active' | 'completed' | 'overdue';

export interface TaskFilters {
  status: FilterStatus;
  category: CategoryId | 'all';
  priority: Priority | 'all';
  search: string;
  sortBy: SortBy;
}

// ─── Focus / Pomodoro ────────────────────────────────────────
export type TimerState = 'idle' | 'running' | 'paused';
export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  taskId?: string;
  type: SessionType;
  duration: number; // seconds
  completedAt: string; // ISO date
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

// ─── Gamification ────────────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO date
  requirement: number; // threshold value
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastCompletionDate?: string; // ISO date (YYYY-MM-DD)
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  dailyCompletions: Record<string, number>; // YYYY-MM-DD -> count
  achievements: Achievement[];
}

// ─── Settings ────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system';
export type { ThemeFlavor } from '@/src/theme/themes';

export interface AppSettings {
  theme: ThemeMode;
  themeFlavor: import('@/src/theme/themes').ThemeFlavor;
  hapticEnabled: boolean;
  notificationsEnabled: boolean;
  defaultCategory: CategoryId;
  defaultPriority: Priority;
  sortBy: SortBy;
  showCompletedTasks: boolean;
  pomodoro: PomodoroSettings;
}
