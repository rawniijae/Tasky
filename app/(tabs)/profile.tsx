import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useTaskStore } from '@/src/stores/taskStore';
import { useGamificationStore } from '@/src/stores/gamificationStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useHaptics } from '@/src/hooks/useHaptics';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { ProgressRing } from '@/src/components/ui/ProgressRing';
import { formatMinutesToDisplay } from '@/src/utils/dates';
import { THEME_FLAVORS } from '@/src/theme/themes';
import { syncUpdateStatus } from '@/src/utils/updateChecker';
import type { ThemeMode } from '@/src/types';

export default function ProfileScreen() {
  const { colors, typography: t, spacing: sp, borderRadius: br, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();

  const tasks = useTaskStore((s) => s.tasks);
  const completedTasks = tasks.filter((t) => t.completed);
  const completionRate = tasks.length > 0 ? completedTasks.length / tasks.length : 0;

  const xp = useGamificationStore((s) => s.xp);
  const level = useGamificationStore((s) => s.level);
  const streak = useGamificationStore((s) => s.streak);
  const longestStreak = useGamificationStore((s) => s.longestStreak);
  const totalTasksCompleted = useGamificationStore((s) => s.totalTasksCompleted);
  const totalFocusMinutes = useGamificationStore((s) => s.totalFocusMinutes);
  const achievements = useGamificationStore((s) => s.achievements);
  const getProgressToNextLevel = useGamificationStore((s) => s.getProgressToNextLevel);
  const getXPForNextLevel = useGamificationStore((s) => s.getXPForNextLevel);

  const getTodayFocusMinutes = useFocusStore((s) => s.getTodayFocusMinutes);
  const getWeeklyFocusData = useFocusStore((s) => s.getWeeklyFocusData);

  const { theme: themeMode, themeFlavor } = useSettingsStore((s) => s.settings);
  const updateInfo = useSettingsStore((s) => s.updateInfo);
  const currentVersion = useSettingsStore((s) => s.currentVersion);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setThemeFlavor = useSettingsStore((s) => s.setThemeFlavor);

  const weeklyData = getWeeklyFocusData();
  const maxWeekly = Math.max(...weeklyData.map((d) => d.minutes), 1);
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const levelProgress = getProgressToNextLevel();
  const nextLevelXP = getXPForNextLevel();

  const themeOptions: { label: string; value: ThemeMode; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Light', value: 'light', icon: 'sunny' },
    { label: 'Dark', value: 'dark', icon: 'moon' },
    { label: 'Auto', value: 'system', icon: 'phone-portrait' },
  ];

  // Daily completions for the week (GitHub-style dots)
  const dailyCompletions = useGamificationStore((s) => s.dailyCompletions);
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return { date: d, count: dailyCompletions[key] || 0 };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        decelerationRate={Platform.OS === 'android' ? 0.985 : 'normal'}
        overScrollMode="never"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[t.headlineLarge, { color: colors.text }]}>Profile</Text>
          <Pressable onPress={() => router.push('/settings' as any)}>
            <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Level Card */}
        <Animated.View entering={FadeIn.delay(100)} style={{ paddingHorizontal: 20 }}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.levelCard, { borderRadius: br.xl }]}
          >
            <View style={styles.levelHeader}>
              <View>
                <Text style={[t.bodySmall, { color: 'rgba(255,255,255,0.7)' }]}>
                  Level
                </Text>
                <Text style={[t.displayMedium, { color: '#FFF' }]}>
                  {level}
                </Text>
              </View>
              <View style={styles.xpContainer}>
                <Text style={[t.bodySmall, { color: 'rgba(255,255,255,0.7)' }]}>
                  {xp} / {nextLevelXP} XP
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={levelProgress}
              height={6}
              color="#FFFFFF"
              backgroundColor="rgba(255,255,255,0.2)"
              style={{ marginTop: 16 }}
            />
          </LinearGradient>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <Ionicons name="flame" size={24} color={colors.warning} />
            <Text style={[t.headlineSmall, { color: colors.text, marginTop: 8 }]}>
              {streak}
            </Text>
            <Text style={[t.caption, { color: colors.textTertiary }]}>Day Streak</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Ionicons name="checkmark-done" size={24} color={colors.success} />
            <Text style={[t.headlineSmall, { color: colors.text, marginTop: 8 }]}>
              {totalTasksCompleted}
            </Text>
            <Text style={[t.caption, { color: colors.textTertiary }]}>Completed</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Ionicons name="timer" size={24} color={colors.primary} />
            <Text style={[t.headlineSmall, { color: colors.text, marginTop: 8 }]}>
              {formatMinutesToDisplay(Math.round(totalFocusMinutes))}
            </Text>
            <Text style={[t.caption, { color: colors.textTertiary }]}>Focused</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color={colors.info} />
            <Text style={[t.headlineSmall, { color: colors.text, marginTop: 8 }]}>
              {Math.round(completionRate * 100)}%
            </Text>
            <Text style={[t.caption, { color: colors.textTertiary }]}>Rate</Text>
          </GlassCard>
        </Animated.View>

        {/* Activity Dots */}
        <Animated.View entering={FadeInDown.delay(300)} style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <GlassCard style={{ padding: 16 }}>
            <Text style={[t.labelMedium, { color: colors.textSecondary, marginBottom: 12 }]}>
              Last 7 Days
            </Text>
            <View style={styles.activityRow}>
              {last7Days.map((day, i) => {
                const intensity = day.count === 0 ? 0 : Math.min(day.count / 5, 1);
                return (
                  <View key={i} style={styles.activityItem}>
                    <View
                      style={[
                        styles.activityDot,
                        {
                          backgroundColor:
                            intensity === 0
                              ? colors.backgroundTertiary
                              : `rgba(99,102,241,${0.3 + intensity * 0.7})`,
                        },
                      ]}
                    />
                    <Text style={[t.caption, { color: colors.textTertiary, marginTop: 4 }]}>
                      {day.date.toLocaleDateString('en', { weekday: 'narrow' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Achievements */}
        <Animated.View entering={FadeInDown.delay(400)} style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={[t.titleSmall, { color: colors.text, marginBottom: 12 }]}>
            Achievements ({unlockedAchievements.length}/{achievements.length})
          </Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((a) => (
              <View
                key={a.id}
                style={[
                  styles.achievementItem,
                  {
                    backgroundColor: a.unlockedAt
                      ? colors.glassBg
                      : colors.backgroundSecondary,
                    borderRadius: br.lg,
                    borderColor: a.unlockedAt ? colors.glassBorder : colors.border,
                    opacity: a.unlockedAt ? 1 : 0.5,
                  },
                ]}
              >
                <Text style={{ fontSize: 24 }}>{a.icon}</Text>
                <Text
                  style={[
                    t.caption,
                    { color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
                  ]}
                  numberOfLines={1}
                >
                  {a.title}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Appearance & Themes */}
        <Animated.View entering={FadeInDown.delay(500)} style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={[t.titleSmall, { color: colors.text, marginBottom: 12 }]}>
            Appearance & Themes
          </Text>
          
          {/* Flavor Selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          >
            {THEME_FLAVORS.map((flavor) => (
              <Pressable
                key={flavor.id}
                onPress={() => {
                  haptics.success();
                  setThemeFlavor(flavor.id);
                }}
                style={[
                  styles.flavorCard,
                  { 
                    backgroundColor: colors.surface,
                    borderColor: themeFlavor === flavor.id ? colors.primary : colors.divider,
                    borderWidth: themeFlavor === flavor.id ? 2 : 1,
                  }
                ]}
              >
                <Text style={{ fontSize: 24 }}>{flavor.icon}</Text>
                <Text style={[t.labelSmall, { color: colors.text, marginTop: 4 }]}>{flavor.name}</Text>
                <View style={styles.colorPreview}>
                  {flavor.preview.map((c, i) => (
                    <View key={i} style={[styles.previewDot, { backgroundColor: c }]} />
                  ))}
                </View>
              </Pressable>
            ))}
          </ScrollView>

          {/* Mode Selector (Light, Dark, Auto) */}
          <View style={[styles.modeContainer, { backgroundColor: colors.surface, borderRadius: br.xl, marginTop: 4 }]}>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => {
                  haptics.selection();
                  setTheme(mode);
                }}
                style={[
                  styles.modeButton,
                  themeMode === mode && { backgroundColor: colors.primary + '20' }
                ]}
              >
                <Ionicons 
                  name={mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'contrast'} 
                  size={18} 
                  color={themeMode === mode ? colors.primary : colors.textTertiary} 
                />
                <Text 
                  style={[
                    t.labelSmall, 
                    { 
                      marginTop: 4, 
                      color: themeMode === mode ? colors.primary : colors.textTertiary,
                      fontWeight: themeMode === mode ? '700' : '500'
                    }
                  ]}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          </View>
        </Animated.View>

        {/* Update Center */}
        <Animated.View entering={FadeInDown.delay(600)} style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={[t.titleSmall, { color: colors.text, marginBottom: 12 }]}>
            Updates & Support
          </Text>
          <GlassCard style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={[t.labelMedium, { color: colors.text }]}>App Version</Text>
                <Text style={[t.caption, { color: colors.textTertiary }]}>v{currentVersion}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => syncUpdateStatus()}
                style={{ padding: 8 }}
              >
                <Text style={[t.labelSmall, { color: colors.primary }]}>Check for updates</Text>
              </TouchableOpacity>
            </View>

            {updateInfo && (
              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.divider }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 8 }} />
                  <Text style={[t.labelMedium, { color: colors.text }]}>Version {updateInfo.latestVersion} Available</Text>
                </View>
                <Text style={[t.caption, { color: colors.textSecondary, marginBottom: 16 }]}>
                  {updateInfo.releaseNotes || 'New features and performance improvements.'}
                </Text>
                <TouchableOpacity 
                  onPress={() => Linking.openURL(updateInfo.updateUrl)}
                  style={[styles.updateButton, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="download-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={[t.labelMedium, { color: '#FFF' }]}>Install Update</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
          
          <Text style={[t.caption, { color: colors.textTertiary, textAlign: 'center', marginTop: 24 }]}>
            Made with ❤️ for Productive People
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  levelCard: {
    padding: 24,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityItem: {
    alignItems: 'center',
  },
  activityDot: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementItem: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
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
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
});
