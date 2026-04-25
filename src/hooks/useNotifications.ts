import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from '@/src/utils/notifications';
import { useSettingsStore } from '@/src/stores/settingsStore';

export function useNotifications() {
  const router = useRouter();
  const notificationsEnabled = useSettingsStore(
    (s) => s.settings.notificationsEnabled
  );
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (!notificationsEnabled) return;

    // Request permissions on mount
    requestNotificationPermissions();

    // Listen for notifications received in foreground
    notificationListener.current = 
      Notifications.addNotificationReceivedListener(notification => {
        // Trigger a strong vibration sequence
        Vibration.vibrate([0, 500, 200, 500]);
      });

    // Listen for notification taps
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        Vibration.cancel(); // Stop vibration on tap
        const taskId = response.notification.request.content.data?.taskId;
        if (taskId) {
          router.push(`/task/${taskId}` as any);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [notificationsEnabled]);
}
