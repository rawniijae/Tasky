import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  differenceInDays,
  addDays,
  addHours,
  addMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';

  const daysDiff = differenceInDays(date, now);

  if (daysDiff > 0 && daysDiff < 7) {
    return format(date, 'EEEE'); // "Monday", "Tuesday"
  }

  if (daysDiff < 0 && daysDiff > -7) {
    return `${Math.abs(daysDiff)}d ago`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'MMM d'); // "Jan 15"
  }

  return format(date, 'MMM d, yyyy');
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return format(date, 'h:mm a');
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatMinutesToDisplay(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function isOverdue(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = startOfDay(new Date());
  return date < today;
}

export function getSmartReminderDate(option: string): Date {
  const now = new Date();
  switch (option) {
    case '30min':
      return addMinutes(now, 30);
    case '1hour':
      return addHours(now, 1);
    case '3hours':
      return addHours(now, 3);
    case 'tomorrow':
      return addDays(startOfDay(now), 1);
    case 'nextWeek':
      return addDays(startOfDay(now), 7);
    default:
      return addHours(now, 1);
  }
}

export function getDateForPreset(preset: string): string {
  const now = new Date();
  switch (preset) {
    case 'today':
      return startOfDay(now).toISOString();
    case 'tomorrow':
      return startOfDay(addDays(now, 1)).toISOString();
    case 'nextWeek':
      return startOfDay(addDays(now, 7)).toISOString();
    default:
      return now.toISOString();
  }
}

export function getWeekDays(date: Date = new Date()): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const start = startOfWeek(firstDay, { weekStartsOn: 1 });
  const end = endOfWeek(lastDay, { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end });
}

export function formatDateForStore(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export { isToday, isTomorrow, isSameDay, format, startOfDay, addDays };
