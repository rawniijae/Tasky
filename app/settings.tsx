import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useTaskStore } from '@/src/stores/taskStore';
import { useGamificationStore } from '@/src/stores/gamificationStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { useHaptics } from '@/src/hooks/useHaptics';
import { IconButton } from '@/src/components/ui/IconButton';
import { THEME_FLAVORS } from '@/src/theme/themes';

// ─── Change this URL to your actual APK download link when you deploy ───
const APP_UPDATE_URL = 'https://github.com/rawniijae/Tasky/releases/latest';

export default function SettingsScreen() {
  const { colors, typography: t, spacing: sp, borderRadius: br } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();
  const settings = useSettingsStore((s) => s.settings);
  const toggleHaptic = useSettingsStore((s) => s.toggleHaptic);
  const toggleNotifications = useSettingsStore((s) => s.toggleNotifications);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setThemeFlavor = useSettingsStore((s) => s.setThemeFlavor);
  const toggleShowCompleted = useSettingsStore((s) => s.toggleShowCompleted);
  const updatePomodoroSettings = useSettingsStore((s) => s.updatePomodoroSettings);
  const resetSettings = useSettingsStore((s) => s.resetSettings);

  const SettingRow = ({
    icon,
    iconColor,
    label,
    value,
    onPress,
    rightElement,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.settingRow,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.divider,
        },
      ]}
      disabled={!onPress && !rightElement}
    >
      <View
        style={[
          styles.settingIcon,
          { backgroundColor: `${iconColor || colors.primary}15` },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={iconColor || colors.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[t.bodyMedium, { color: colors.text }]}>{label}</Text>
        {value && (
          <Text style={[t.bodySmall, { color: colors.textTertiary }]}>
            {value}
          </Text>
        )}
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      )}
    </Pressable>
  );

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all tasks, stats, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            // Reset all stores (works regardless of storage backend)
            useTaskStore.persist.clearStorage();
            useGamificationStore.persist.clearStorage();
            useFocusStore.persist.clearStorage();
            resetSettings();
            router.back();
          },
        },
      ]
    );
  };

  const pomodoroOptions = [
    { label: 'Work Duration', value: settings.pomodoro.workDuration, key: 'workDuration' as const },
    { label: 'Short Break', value: settings.pomodoro.shortBreakDuration, key: 'shortBreakDuration' as const },
    { label: 'Long Break', value: settings.pomodoro.longBreakDuration, key: 'longBreakDuration' as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton icon="arrow-back" onPress={() => router.back()} />
        <Text style={[t.titleLarge, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* General */}
        <Animated.View entering={FadeInDown.delay(50)}>
          <Text
            style={[
              t.labelMedium,
              { color: colors.textTertiary, paddingHorizontal: 20, paddingVertical: 12 },
            ]}
          >
            GENERAL
          </Text>
          <View style={[styles.settingGroup, { borderRadius: br.xl }]}>
            <SettingRow
              icon="phone-portrait-outline"
              label="Haptic Feedback"
              rightElement={
                <Switch
                  value={settings.hapticEnabled}
                  onValueChange={() => {
                    haptics.selection();
                    toggleHaptic();
                  }}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
            <SettingRow
              icon="notifications-outline"
              iconColor={colors.warning}
              label="Notifications"
              rightElement={
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={() => {
                    haptics.selection();
                    toggleNotifications();
                  }}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
            <SettingRow
              icon="checkmark-done-outline"
              iconColor={colors.success}
              label="Show Completed Tasks"
              rightElement={
                <Switch
                  value={settings.showCompletedTasks}
                  onValueChange={() => {
                    haptics.selection();
                    toggleShowCompleted();
                  }}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
          </View>
        </Animated.View>

        {/* Pomodoro */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <Text
            style={[
              t.labelMedium,
              { color: colors.textTertiary, paddingHorizontal: 20, paddingVertical: 12 },
            ]}
          >
            POMODORO TIMER
          </Text>
          <View style={[styles.settingGroup, { borderRadius: br.xl }]}>
            {pomodoroOptions.map((opt) => (
              <SettingRow
                key={opt.key}
                icon="timer-outline"
                iconColor={colors.info}
                label={opt.label}
                value={`${opt.value} min`}
                rightElement={
                  <View style={styles.stepper}>
                    <Pressable
                      onPress={() => {
                        haptics.light();
                        if (opt.value > 1) {
                          updatePomodoroSettings({ [opt.key]: opt.value - 5 });
                        }
                      }}
                      style={[styles.stepButton, { backgroundColor: colors.backgroundSecondary }]}
                    >
                      <Ionicons name="remove" size={16} color={colors.text} />
                    </Pressable>
                    <Text style={[t.labelMedium, { color: colors.text, minWidth: 38, textAlign: 'center' }]}>
                      {opt.value}m
                    </Text>
                    <Pressable
                      onPress={() => {
                        haptics.light();
                        updatePomodoroSettings({ [opt.key]: opt.value + 5 });
                      }}
                      style={[styles.stepButton, { backgroundColor: colors.backgroundSecondary }]}
                    >
                      <Ionicons name="add" size={16} color={colors.text} />
                    </Pressable>
                  </View>
                }
              />
            ))}
          </View>
        </Animated.View>

        {/* Data */}
        <Animated.View entering={FadeInDown.delay(250)}>
          <Text
            style={[
              t.labelMedium,
              { color: colors.textTertiary, paddingHorizontal: 20, paddingVertical: 12 },
            ]}
          >
            DATA
          </Text>
          <View style={[styles.settingGroup, { borderRadius: br.xl }]}>
            <SettingRow
              icon="trash-outline"
              iconColor={colors.danger}
              label="Reset All Data"
              onPress={handleResetData}
            />
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(350)}>
          <Text
            style={[
              t.labelMedium,
              { color: colors.textTertiary, paddingHorizontal: 20, paddingVertical: 12 },
            ]}
          >
            ABOUT
          </Text>
          <View style={[styles.settingGroup, { borderRadius: br.xl }]}>
            <SettingRow
              icon="cloud-download-outline"
              iconColor="#10B981"
              label="Update App"
              value="Download latest version"
              onPress={() => {
                haptics.light();
                Linking.openURL(APP_UPDATE_URL);
              }}
            />
            <SettingRow
              icon="information-circle-outline"
              iconColor={colors.textSecondary}
              label="Version"
              value="1.0.0"
              rightElement={<Text style={[t.bodySmall, { color: colors.textTertiary }]}>1.0.0</Text>}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  settingGroup: {
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flavorCard: {
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 90,
  },
  modeContainer: {
    flexDirection: 'row',
    padding: 6,
    gap: 6,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
