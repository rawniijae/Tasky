import type { Task } from '@/src/types';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Tasky Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500, 200, 500],
      lightColor: '#6366F1',
      enableVibrate: true,
      showBadge: true,
    });
  }

  return true;
}

/**
 * Schedule notifications for a task (10 mins before and at the time)
 */
export async function scheduleTaskNotifications(
  task: Task
): Promise<string[]> {
  if (!task.dueDate) return [];

  const baseDate = new Date(task.dueDate);
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    baseDate.setHours(hours, minutes, 0, 0);
  } else {
    baseDate.setHours(9, 0, 0, 0); // Default to 9 AM
  }

  const notificationIds: string[] = [];

  // 1. Schedule "At the time" notification
  if (baseDate > new Date()) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Task Due: ${task.title}`,
          body: task.description || 'This task is due now!',
          data: { taskId: task.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 500, 200, 500],
          channelId: 'task-reminders',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: baseDate,
        },
      });
      notificationIds.push(id);
    } catch (error) {
      console.warn('Failed to schedule "at time" notification:', error);
    }
  }

  // 2. Schedule "10 mins before" notification
  const beforeDate = new Date(baseDate.getTime() - 10 * 60000);
  if (beforeDate > new Date()) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 Upcoming: ${task.title}`,
          body: 'This task is due in 10 minutes.',
          data: { taskId: task.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          channelId: 'task-reminders',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: beforeDate,
        },
      });
      notificationIds.push(id);
    } catch (error) {
      console.warn('Failed to schedule "10 mins before" notification:', error);
    }
  }

  return notificationIds;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn('Failed to cancel notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule a quick reminder (e.g., "remind me in 1 hour")
 */
export async function scheduleQuickReminder(
  title: string,
  seconds: number
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Reminder`,
        body: title,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    });
    return id;
  } catch (error) {
    console.warn('Failed to schedule reminder:', error);
    return null;
  }
}

/**
 * Schedule an overdue check notification
 */
export async function scheduleOverdueCheck() {
  try {
    // Schedule daily at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📌 Daily Check',
        body: 'Review your tasks for today!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: tomorrow,
      },
    });
  } catch (error) {
    console.warn('Failed to schedule overdue check:', error);
  }
}
