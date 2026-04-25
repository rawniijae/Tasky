import type { Priority, CategoryId, Task } from '@/src/types';

// ─── Rule-based AI Suggestions ──────────────────────────────

const URGENT_KEYWORDS = [
  'urgent', 'asap', 'emergency', 'critical', 'deadline', 'immediately',
  'important', 'must', 'required', 'essential', 'overdue',
];

const HIGH_KEYWORDS = [
  'meeting', 'presentation', 'review', 'submit', 'deliver', 'report',
  'client', 'boss', 'interview', 'exam', 'test', 'project',
];

const WORK_KEYWORDS = [
  'meeting', 'project', 'report', 'email', 'client', 'presentation',
  'deadline', 'office', 'team', 'review', 'sprint', 'deploy', 'release',
  'code', 'design', 'manager', 'stakeholder',
];

const STUDY_KEYWORDS = [
  'study', 'exam', 'homework', 'assignment', 'lecture', 'course',
  'read', 'research', 'thesis', 'chapter', 'notes', 'class', 'quiz',
];

const HEALTH_KEYWORDS = [
  'exercise', 'gym', 'doctor', 'medicine', 'workout', 'run', 'yoga',
  'diet', 'health', 'sleep', 'meditate', 'dentist', 'walk', 'stretch',
];

const SHOPPING_KEYWORDS = [
  'buy', 'shop', 'order', 'purchase', 'grocery', 'store', 'amazon',
  'deliver', 'pick up', 'return', 'mall',
];

const FINANCE_KEYWORDS = [
  'pay', 'bill', 'tax', 'invoice', 'budget', 'bank', 'transfer',
  'insurance', 'loan', 'rent', 'salary', 'investment',
];

/**
 * Suggest a priority level based on task title keywords
 */
export function suggestPriority(title: string): Priority {
  const lower = title.toLowerCase();

  if (URGENT_KEYWORDS.some((kw) => lower.includes(kw))) return 'p1';
  if (HIGH_KEYWORDS.some((kw) => lower.includes(kw))) return 'p2';

  // Short tasks are usually quick → low priority
  if (lower.split(' ').length <= 2) return 'p4';

  return 'p3';
}

/**
 * Suggest a category based on task title keywords
 */
export function suggestCategory(title: string): CategoryId {
  const lower = title.toLowerCase();

  if (WORK_KEYWORDS.some((kw) => lower.includes(kw))) return 'work';
  if (STUDY_KEYWORDS.some((kw) => lower.includes(kw))) return 'study';
  if (HEALTH_KEYWORDS.some((kw) => lower.includes(kw))) return 'health';
  if (SHOPPING_KEYWORDS.some((kw) => lower.includes(kw))) return 'shopping';
  if (FINANCE_KEYWORDS.some((kw) => lower.includes(kw))) return 'finance';

  return 'personal';
}

/**
 * Generate a productivity insight message based on task history
 */
export function getProductivityInsight(
  dailyCompletions: Record<string, number>,
  totalCompleted: number,
  streak: number
): string {
  const entries = Object.entries(dailyCompletions).sort(([a], [b]) => b.localeCompare(a));

  // Find most productive day of week
  const dayTotals: Record<number, number> = {};
  entries.forEach(([date, count]) => {
    const day = new Date(date).getDay();
    dayTotals[day] = (dayTotals[day] || 0) + count;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bestDay = Object.entries(dayTotals).sort(([, a], [, b]) => b - a)[0];

  if (streak >= 7) {
    return `🔥 Amazing ${streak}-day streak! You're on fire!`;
  }

  if (bestDay) {
    return `📊 You're most productive on ${dayNames[Number(bestDay[0])]}s. Plan big tasks then!`;
  }

  if (totalCompleted > 10) {
    const avg = (totalCompleted / Math.max(entries.length, 1)).toFixed(1);
    return `📈 You average ${avg} tasks per day. Keep it up!`;
  }

  if (totalCompleted === 0) {
    return `🚀 Complete your first task to start tracking your productivity!`;
  }

  return `💪 You've completed ${totalCompleted} tasks so far. Keep going!`;
}

/**
 * Suggest a smart due date based on keywords
 */
export function suggestDueDate(title: string): string | undefined {
  const lower = title.toLowerCase();
  const now = new Date();

  if (lower.includes('today') || lower.includes('tonight')) {
    return now.toISOString();
  }

  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString();
  }

  if (lower.includes('this week') || lower.includes('friday')) {
    const friday = new Date(now);
    friday.setDate(friday.getDate() + (5 - friday.getDay() + 7) % 7);
    return friday.toISOString();
  }

  if (lower.includes('next week') || lower.includes('monday')) {
    const nextMonday = new Date(now);
    nextMonday.setDate(nextMonday.getDate() + (1 - nextMonday.getDay() + 7) % 7 + 7);
    return nextMonday.toISOString();
  }

  return undefined;
}
