import React, { useEffect, useRef } from 'react';
import type { ScrollView as ScrollViewType } from 'react-native';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useFocusStore } from '@/src/stores/focusStore';
import { useGamificationStore } from '@/src/stores/gamificationStore';
import { useHaptics } from '@/src/hooks/useHaptics';
import { ProgressRing } from '@/src/components/ui/ProgressRing';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { IconButton } from '@/src/components/ui/IconButton';
import { DiceRoller } from '@/src/components/focus/DiceRoller';
import { formatDuration, formatMinutesToDisplay } from '@/src/utils/dates';

export default function FocusScreen() {
  const { colors, typography: t, spacing: sp, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollViewType>(null);

  const timerState = useFocusStore((s) => s.timerState);
  const sessionType = useFocusStore((s) => s.sessionType);
  const timeRemaining = useFocusStore((s) => s.timeRemaining);
  const sessionsCompleted = useFocusStore((s) => s.sessionsCompleted);
  const settings = useFocusStore((s) => s.settings);
  const startTimer = useFocusStore((s) => s.startTimer);
  const pauseTimer = useFocusStore((s) => s.pauseTimer);
  const resetTimer = useFocusStore((s) => s.resetTimer);
  const tick = useFocusStore((s) => s.tick);
  const skipToNext = useFocusStore((s) => s.skipToNext);
  const getTodayFocusMinutes = useFocusStore((s) => s.getTodayFocusMinutes);
  const getWeeklyFocusData = useFocusStore((s) => s.getWeeklyFocusData);
  const addXPForFocus = useGamificationStore((s) => s.addXPForFocus);

  const totalDuration =
    sessionType === 'work'
      ? settings.workDuration * 60
      : sessionType === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;

  const progress = 1 - timeRemaining / totalDuration;
  const todayMinutes = getTodayFocusMinutes();
  const weeklyData = getWeeklyFocusData();
  const maxWeekly = Math.max(...weeklyData.map((d) => d.minutes), 1);

  // Timer interval
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        const completed = tick();
        if (completed) {
          haptics.success();
          if (sessionType === 'work') {
            addXPForFocus(settings.workDuration);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState]);

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'work': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
    }
  };

  const getGradientColors = (): [string, string] => {
    switch (sessionType) {
      case 'work': return [colors.gradientStart, colors.gradientEnd];
      case 'shortBreak': return ['#10B981', '#059669'];
      case 'longBreak': return ['#0EA5E9', '#0284C7'];
    }
  };

  const ringColor =
    sessionType === 'work'
      ? colors.primary
      : sessionType === 'shortBreak'
      ? colors.success
      : colors.info;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        decelerationRate={Platform.OS === 'android' ? 0.985 : 'normal'}
        overScrollMode="never"
      >
      <View style={{ paddingTop: insets.top + 12 }}>
        <Text style={[t.headlineLarge, { color: colors.text, paddingHorizontal: 20 }]}>
          Focus
        </Text>
      </View>

      <View style={styles.timerSection}>
        {/* Session type indicator */}
        <Animated.View entering={FadeIn.delay(100)}>
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sessionBadge}
          >
            <Ionicons
              name={sessionType === 'work' ? 'flash' : 'cafe'}
              size={14}
              color="#FFF"
            />
            <Text style={[t.labelSmall, { color: '#FFF', marginLeft: 6 }]}>
              {getSessionLabel()}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Timer Ring */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.ringContainer}>
          <ProgressRing
            progress={progress}
            size={220}
            strokeWidth={10}
            color={ringColor}
            showLabel={false}
          >
            <Text style={[t.displayLarge, { color: colors.text, fontSize: 48 }]}>
              {formatDuration(timeRemaining)}
            </Text>
            <Text style={[t.caption, { color: colors.textTertiary, marginTop: 4 }]}>
              Session {(sessionsCompleted % settings.sessionsBeforeLongBreak) + 1}/{settings.sessionsBeforeLongBreak}
            </Text>
          </ProgressRing>
        </Animated.View>

        {/* Controls */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.controls}>
          <IconButton
            icon="refresh"
            size={24}
            onPress={() => {
              haptics.light();
              resetTimer();
            }}
            color={colors.textSecondary}
            backgroundColor={colors.backgroundSecondary}
          />

          <Pressable
            onPress={() => {
              haptics.medium();
              if (timerState === 'running') {
                pauseTimer();
              } else {
                startTimer();
              }
            }}
            style={styles.playButton}
          >
            <LinearGradient
              colors={getGradientColors()}
              style={styles.playButtonGradient}
            >
              <Ionicons
                name={timerState === 'running' ? 'pause' : 'play'}
                size={32}
                color="#FFF"
              />
            </LinearGradient>
          </Pressable>

          <IconButton
            icon="play-skip-forward"
            size={24}
            onPress={() => {
              haptics.light();
              skipToNext();
            }}
            color={colors.textSecondary}
            backgroundColor={colors.backgroundSecondary}
          />
        </Animated.View>
      </View>

      {/* Stats */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.statsRow}>
        <GlassCard style={styles.statCard}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <Text style={[t.titleMedium, { color: colors.text, marginTop: 6 }]}>
            {formatMinutesToDisplay(Math.round(todayMinutes))}
          </Text>
          <Text style={[t.caption, { color: colors.textTertiary }]}>Today</Text>
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <Ionicons name="flame-outline" size={20} color={colors.warning} />
          <Text style={[t.titleMedium, { color: colors.text, marginTop: 6 }]}>
            {sessionsCompleted}
          </Text>
          <Text style={[t.caption, { color: colors.textTertiary }]}>Sessions</Text>
        </GlassCard>
      </Animated.View>

        {/* Weekly mini chart */}
      <Animated.View entering={FadeInDown.delay(500)} style={{ paddingHorizontal: 20 }}>
        <GlassCard style={{ padding: 16 }}>
          <Text style={[t.labelMedium, { color: colors.textSecondary, marginBottom: 12 }]}>
            This Week
          </Text>
          <View style={styles.chartRow}>
            {weeklyData.map((d, i) => (
              <View key={i} style={styles.chartItem}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max((d.minutes / maxWeekly) * 100, 4)}%`,
                        backgroundColor:
                          d.minutes > 0 ? colors.primary : colors.backgroundTertiary,
                        borderRadius: 4,
                      },
                    ]}
                  />
                </View>
                <Text style={[t.caption, { color: colors.textTertiary, marginTop: 4 }]}>
                  {d.day}
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </Animated.View>

      {/* Dice Roller */}
      <Animated.View entering={FadeInDown.delay(600)}>
        <DiceRoller scrollViewRef={scrollRef} />
      </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  timerSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  ringContainer: {
    marginBottom: 32,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
  },
  playButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 80,
  },
  chartItem: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: 16,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    minHeight: 4,
  },
});
