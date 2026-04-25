import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useCallback } from 'react';

export function useHaptics() {
  const hapticEnabled = useSettingsStore((s) => s.settings.hapticEnabled);

  const light = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticEnabled]);

  const medium = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [hapticEnabled]);

  const heavy = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [hapticEnabled]);

  const success = useCallback(() => {
    if (hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [hapticEnabled]);

  const warning = useCallback(() => {
    if (hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [hapticEnabled]);

  const error = useCallback(() => {
    if (hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [hapticEnabled]);

  const selection = useCallback(() => {
    if (hapticEnabled) {
      Haptics.selectionAsync();
    }
  }, [hapticEnabled]);

  return { light, medium, heavy, success, warning, error, selection };
}
