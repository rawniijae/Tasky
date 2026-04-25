import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/src/utils/storage';
import {
  scheduleTaskNotifications,
  cancelNotification,
} from '@/src/utils/notifications';
import type { Task, Subtask, Priority, CategoryId, RecurrenceRule, TaskFilters, SortBy } from '@/src/types';


// ─── Helpers ─────────────────────────────────────────────────
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const priorityOrder: Record<Priority, number> = {
  p1: 0, p2: 1, p3: 2, p4: 3,
};

function sortTasks(tasks: Task[], sortBy: SortBy): Task[] {
  const sorted = [...tasks];
  switch (sortBy) {
    case 'priority':
      return sorted.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    case 'dueDate':
      return sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    case 'createdAt':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'manual':
      return sorted.sort((a, b) => a.order - b.order);
    default:
      return sorted;
  }
}

function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    // Status
    if (filters.status === 'active' && task.completed) return false;
    if (filters.status === 'completed' && !task.completed) return false;
    if (filters.status === 'overdue') {
      if (task.completed) return false;
      if (!task.dueDate) return false;
      if (new Date(task.dueDate) >= new Date()) return false;
    }

    // Category
    if (filters.category !== 'all' && task.category !== filters.category)
      return false;

    // Priority
    if (filters.priority !== 'all' && task.priority !== filters.priority)
      return false;

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(q);
      const matchesDesc = task.description.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc) return false;
    }

    return true;
  });
}

function getNextRecurrenceDate(
  currentDate: string,
  recurrence: RecurrenceRule
): string | undefined {
  if (recurrence.type === 'none') return undefined;
  const date = new Date(currentDate);

  switch (recurrence.type) {
    case 'daily':
      date.setDate(date.getDate() + (recurrence.interval || 1));
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7 * (recurrence.interval || 1));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + (recurrence.interval || 1));
      break;
    case 'custom':
      date.setDate(date.getDate() + (recurrence.interval || 1));
      break;
  }
  return date.toISOString();
}

// ─── Store ───────────────────────────────────────────────────
interface TaskState {
  tasks: Task[];
  filters: TaskFilters;

  // CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'completed' | 'completedAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  clearCompletedTasks: () => void;

  // Subtasks
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;

  // Ordering
  reorderTasks: (fromIndex: number, toIndex: number) => void;

  // Filtering
  setFilters: (updates: Partial<TaskFilters>) => void;
  resetFilters: () => void;

  // Computed
  getFilteredTasks: () => Task[];
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getCompletionRate: () => number;
  getCompletedToday: () => number;
  getTotalActive: () => number;
}

const defaultFilters: TaskFilters = {
  status: 'all',
  category: 'all',
  priority: 'all',
  search: '',
  sortBy: 'priority',
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filters: defaultFilters,

      addTask: (taskData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const tasks = get().tasks;
        const newTask: Task = {
          ...taskData,
          id,
          completed: false,
          createdAt: now,
          updatedAt: now,
          order: tasks.length,
        };

        // Schedule notifications
        if (!newTask.completed && newTask.dueDate) {
          scheduleTaskNotifications(newTask).then((notifIds) => {
            if (notifIds.length > 0) {
              get().updateTask(id, { notificationIds: notifIds });
            }
          });
        }

        set({ tasks: [...tasks, newTask] });
        return id;
      },

      updateTask: (id, updates) => {
        const tasks = get().tasks;
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };

        // Handle notification rescheduling
        if (updates.dueDate !== undefined || updates.dueTime !== undefined || updates.title !== undefined) {
          if (task.notificationIds) {
            task.notificationIds.forEach(id => cancelNotification(id));
          }
          if (!updatedTask.completed && updatedTask.dueDate) {
            scheduleTaskNotifications(updatedTask).then((notifIds) => {
              if (notifIds.length > 0) {
                set({
                  tasks: get().tasks.map((t) =>
                    t.id === id ? { ...t, notificationIds: notifIds } : t
                  ),
                });
              }
            });
          }
        }

        set({
          tasks: tasks.map((t) => (t.id === id ? updatedTask : t)),
        });
      },

      deleteTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task?.notificationIds) {
          task.notificationIds.forEach(id => cancelNotification(id));
        }
        set({ tasks: get().tasks.filter((t) => t.id !== id) });
      },
      
      clearCompletedTasks: () => {
        const completedTasks = get().tasks.filter(t => t.completed);
        completedTasks.forEach(t => {
          if (t.notificationIds) {
            t.notificationIds.forEach(nid => cancelNotification(nid));
          }
        });
        set({ tasks: get().tasks.filter((t) => !t.completed) });
      },

      toggleTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const now = new Date().toISOString();
        const completed = !task.completed;

        // Cancel notifications if completing, or schedule if un-completing
        if (completed && task.notificationIds) {
          task.notificationIds.forEach(id => cancelNotification(id));
        } else if (!completed && task.dueDate) {
          scheduleTaskNotifications({ ...task, completed }).then((notifIds) => {
            if (notifIds.length > 0) {
              get().updateTask(id, { notificationIds: notifIds });
            }
          });
        }

        // If completing a recurring task, create next occurrence
        if (completed && task.recurrence.type !== 'none' && task.dueDate) {
          const nextDueDate = getNextRecurrenceDate(
            task.dueDate,
            task.recurrence
          );
          if (nextDueDate) {
            get().addTask({
              title: task.title,
              description: task.description,
              priority: task.priority,
              category: task.category,
              subtasks: task.subtasks.map((st) => ({
                ...st,
                id: generateId(),
                completed: false,
              })),
              recurrence: task.recurrence,
              dueDate: nextDueDate,
              dueTime: task.dueTime,
              reminderMinutes: task.reminderMinutes,
            });
          }
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed,
                  completedAt: completed ? now : undefined,
                  updatedAt: now,
                  notificationIds: completed ? undefined : t.notificationIds,
                }
              : t
          ),
        }));

        // Trigger puzzle reward if task is completed
        if (completed) {
          try {
            const { usePuzzleStore } = require('./puzzleStore');
            const store = usePuzzleStore.getState();
            if (store && typeof store.unlockPiece === 'function') {
              store.unlockPiece();
            }
          } catch (e) {
            console.warn('Puzzle reward failed:', e);
          }
        }
      },

      addSubtask: (taskId, title) => {
        const subtask: Subtask = { id: generateId(), title, completed: false };
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: [...t.subtasks, subtask], updatedAt: new Date().toISOString() }
              : t
          ),
        });
      },

      toggleSubtask: (taskId, subtaskId) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((st) =>
                    st.id === subtaskId
                      ? { ...st, completed: !st.completed }
                      : st
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        });
      },

      deleteSubtask: (taskId, subtaskId) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        });
      },

      updateSubtask: (taskId, subtaskId, title) => {
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, title } : st
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        });
      },

      reorderTasks: (fromIndex, toIndex) => {
        const tasks = [...get().tasks];
        const [removed] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, removed);
        set({
          tasks: tasks.map((t, i) => ({ ...t, order: i })),
        });
      },

      setFilters: (updates) => {
        set({ filters: { ...get().filters, ...updates } });
      },

      resetFilters: () => {
        set({ filters: defaultFilters });
      },

      getFilteredTasks: () => {
        const { tasks, filters } = get();
        const filtered = filterTasks(tasks, filters);
        return sortTasks(filtered, filters.sortBy);
      },

      getTodayTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return get()
          .tasks.filter((t) => {
            if (t.completed) return false;
            if (!t.dueDate) return false;
            const due = new Date(t.dueDate);
            return due >= today && due < tomorrow;
          })
          .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      },

      getOverdueTasks: () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return get()
          .tasks.filter((t) => {
            if (t.completed) return false;
            if (!t.dueDate) return false;
            return new Date(t.dueDate) < now;
          })
          .sort(
            (a, b) =>
              new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
          );
      },

      getUpcomingTasks: () => {
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return get()
          .tasks.filter((t) => {
            if (t.completed) return false;
            if (!t.dueDate) return t.dueDate === undefined; // tasks with no due date go to upcoming
            return new Date(t.dueDate) >= tomorrow;
          })
          .sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          });
      },

      getCompletedTasks: () => {
        return get()
          .tasks.filter((t) => t.completed)
          .sort(
            (a, b) =>
              new Date(b.completedAt || 0).getTime() -
              new Date(a.completedAt || 0).getTime()
          );
      },

      getCompletionRate: () => {
        const { tasks } = get();
        if (tasks.length === 0) return 0;
        const completed = tasks.filter((t) => t.completed).length;
        return completed / tasks.length;
      },

      getCompletedToday: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().tasks.filter((t) => {
          if (!t.completed || !t.completedAt) return false;
          return new Date(t.completedAt) >= today;
        }).length;
      },

      getTotalActive: () => {
        return get().tasks.filter((t) => !t.completed).length;
      },
    }),
    {
      name: 'tasky-tasks',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
