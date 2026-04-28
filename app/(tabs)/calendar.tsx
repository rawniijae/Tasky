import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useTaskStore } from '@/src/stores/taskStore';
import { useHaptics } from '@/src/hooks/useHaptics';
import { TaskCard } from '@/src/components/task/TaskCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { FAB } from '@/src/components/ui/FAB';
import { getWeekDays, isSameDay, format, addDays, startOfDay } from '@/src/utils/dates';

export default function CalendarScreen() {
  const { colors, typography: t, spacing: sp, borderRadius: br } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);

  const tasks = useTaskStore((s) => s.tasks);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const baseDate = addDays(new Date(), weekOffset * 7);
  const weekDays = useMemo(() => getWeekDays(baseDate), [weekOffset]);

  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), selectedDate);
    });
  }, [tasks, selectedDate]);

  const getTaskCountForDate = (date: Date): number => {
    return tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;
      return isSameDay(new Date(task.dueDate), date);
    }).length;
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top + 12 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[t.headlineLarge, { color: colors.text }]}>
            Calendar
          </Text>
          <Text style={[t.bodyMedium, { color: colors.textSecondary }]}>
            {format(selectedDate, 'MMMM yyyy')}
          </Text>
        </View>

        {/* Week navigation */}
        <View style={styles.weekNav}>
          <Pressable
            onPress={() => {
              haptics.light();
              setWeekOffset((w) => w - 1);
            }}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => {
              haptics.light();
              setWeekOffset(0);
              setSelectedDate(new Date());
            }}
          >
            <Text style={[t.labelMedium, { color: colors.primary }]}>Today</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              haptics.light();
              setWeekOffset((w) => w + 1);
            }}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Week strip */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.weekStrip}>
          {weekDays.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const taskCount = getTaskCountForDate(day);

            return (
              <Pressable
                key={i}
                onPress={() => {
                  haptics.selection();
                  setSelectedDate(day);
                }}
                style={[
                  styles.dayItem,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : 'transparent',
                    borderRadius: br.xl,
                  },
                ]}
              >
                <Text
                  style={[
                    t.caption,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isToday
                        ? colors.primary
                        : colors.textTertiary,
                    },
                  ]}
                >
                  {dayNames[i]}
                </Text>
                <Text
                  style={[
                    t.titleMedium,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isToday
                        ? colors.primary
                        : colors.text,
                      marginTop: 4,
                    },
                  ]}
                >
                  {format(day, 'd')}
                </Text>
                {taskCount > 0 && (
                  <View
                    style={[
                      styles.taskDot,
                      {
                        backgroundColor: isSelected
                          ? '#FFFFFF'
                          : colors.primary,
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      </View>

      {/* Tasks for selected date */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        decelerationRate={Platform.OS === 'android' ? 0.985 : 'normal'}
        overScrollMode="never"
      >
        <View style={styles.dateHeader}>
          <Text style={[t.titleSmall, { color: colors.text }]}>
            {isSameDay(selectedDate, new Date())
              ? 'Today'
              : format(selectedDate, 'EEEE, MMM d')}
          </Text>
          <Text style={[t.caption, { color: colors.textTertiary }]}>
            {tasksForSelectedDate.length} task{tasksForSelectedDate.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {tasksForSelectedDate.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No tasks for this day"
            subtitle="Tap + to add a task"
          />
        ) : (
          tasksForSelectedDate.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onPress={() => router.push(`/task/${task.id}` as any)}
              onToggle={() => toggleTask(task.id)}
              onDelete={() => deleteTask(task.id)}
            />
          ))
        )}
      </ScrollView>

      <FAB onPress={() => router.push('/task/create' as any)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    minWidth: 42,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
});
