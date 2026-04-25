import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  RefreshControl,
  ImageBackground,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTaskStore } from '../../src/stores/taskStore';
import { useGamificationStore } from '../../src/stores/gamificationStore';
import { Header } from '../../src/components/common/Header';
import { WaterDroplets, WaterRippleOverlay } from '../../src/components/effects/WaterEffect';
import { PuzzleCard } from '../../src/components/puzzle/PuzzleCard';
import { MotivationalQuote } from '../../src/components/common/MotivationalQuote';
import { SearchBar } from '../../src/components/common/SearchBar';
import { TaskFilters } from '../../src/components/task/TaskFilters';
import { TaskCard } from '../../src/components/task/TaskCard';
import { FAB } from '../../src/components/ui/FAB';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { useHaptics } from '../../src/hooks/useHaptics';
import type { Task } from '../../src/types';

export default function HomeScreen() {
  const { colors, typography: t, spacing: sp } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tasks = useTaskStore((s) => s.tasks);
  const filters = useTaskStore((s) => s.filters);
  const setFilters = useTaskStore((s) => s.setFilters);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const addXPForTask = useGamificationStore((s) => s.addXPForTask);
  const updateStreak = useGamificationStore((s) => s.updateStreak);
  const checkAchievements = useGamificationStore((s) => s.checkAchievements);

  const handleToggleTask = useCallback((task: Task) => {
    const wasCompleted = task.completed;
    toggleTask(task.id);
    // Award XP only when marking as complete (not undo)
    if (!wasCompleted) {
      addXPForTask(task.priority);
      updateStreak();
      checkAchievements();
    }
  }, [toggleTask, addXPForTask, updateStreak, checkAchievements]);
  
  // Memoize lists to avoid infinite loops and unnecessary re-renders
  const overdue = React.useMemo(() => 
    tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).getTime() < new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  , [tasks]);

  const priorityOrder = { high: 1, medium: 2, low: 3 };

  const today = React.useMemo(() => {
    const start = new Date().setHours(0,0,0,0);
    const end = new Date().setHours(23,59,59,999);
    return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).getTime() >= start && new Date(t.dueDate).getTime() <= end)
    .sort((a, b) => {
      const pA = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
      const pB = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
      return pA - pB;
    });
  }, [tasks]);

  const upcoming = React.useMemo(() => {
    const endOfToday = new Date().setHours(23,59,59,999);
    return tasks.filter(t => !t.completed && (!t.dueDate || new Date(t.dueDate).getTime() > endOfToday))
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks]);

  const completed = React.useMemo(() => 
    tasks.filter(t => t.completed)
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
  , [tasks]);

  const completedToday = React.useMemo(() => {
    const start = new Date().setHours(0,0,0,0);
    return tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).getTime() >= start).length;
  }, [tasks]);

  const totalActive = React.useMemo(() => tasks.filter(t => !t.completed).length, [tasks]);

  // Apply search filter
  const filterBySearch = (list: Task[]) => {
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  };

  // Apply category/status filters
  const filterByFilters = (list: Task[]) => {
    return list.filter((task) => {
      if (filters.category !== 'all' && task.category !== filters.category)
        return false;
      return true;
    });
  };

  const filteredOverdue = filterBySearch(filterByFilters(overdue));
  const filteredToday = filterBySearch(filterByFilters(today));
  const filteredUpcoming = filterBySearch(filterByFilters(upcoming));
  const filteredCompleted = filterBySearch(filterByFilters(completed)).slice(0, 5);

  const todayTotal = today.length + overdue.length;
  const todayDone = completedToday;
  const todayProgress = todayTotal > 0 ? todayDone / (todayTotal + todayDone) : 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const hasNoTasks = tasks.length === 0;
  const hasNoFilteredTasks =
    filteredOverdue.length === 0 &&
    filteredToday.length === 0 &&
    filteredUpcoming.length === 0;

  const renderSection = (title: string, items: Task[], icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap, color: string, onClearAll?: () => void) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: color }]} />
          <Text style={[t.titleSmall, { color: colors.text }]}>{title}</Text>
          <Text style={[t.caption, { color: colors.textTertiary, marginLeft: 6 }]}>
            {items.length}
          </Text>
          {onClearAll && (
            <Pressable 
              onPress={() => {
                haptics.selection();
                Alert.alert(
                  "Clear Completed Tasks",
                  "Are you sure you want to delete all completed tasks? This cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete All", style: "destructive", onPress: onClearAll }
                  ]
                );
              }}
              style={{ marginLeft: 'auto' }}
            >
              <Text style={[t.labelSmall, { color: colors.danger }]}>Clear All</Text>
            </Pressable>
          )}
        </View>
        {items.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onPress={() => router.push(`/task/${task.id}` as any)}
            onToggle={() => handleToggleTask(task)}
            onDelete={() => deleteTask(task.id)}
          />
        ))}
      </View>
    );
  };

  const themeFlavor = useSettingsStore((s) => s.settings.themeFlavor);

  const themeBackgrounds: Record<string, any> = {
    anime: require('../../assets/themes/anime_bg.png'),
    hello_kitty: require('../../assets/themes/hello_kitty_bg.png'),
    sunset: require('../../assets/themes/sunset_bg.png'),
    ocean: require('../../assets/themes/ocean_bg.png'),
    emo: require('../../assets/themes/emo_bg.png'),
  };

  const renderContent = () => (
    <>
      {/* Today's Progress */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.progressSection}>
        <GlassCard style={styles.progressCard}>
          <View style={styles.progressContent}>
            <View style={{ flex: 1 }}>
              <Text style={[t.titleMedium, { color: colors.text }]}>
                Today's Progress
              </Text>
              <Text
                style={[
                  t.displaySmall,
                  { color: colors.primary, marginTop: 4 },
                ]}
              >
                {completedToday} done
              </Text>
              <Text style={[t.caption, { color: colors.textTertiary, marginTop: 2 }]}>
                {todayTotal} tasks remaining
              </Text>
            </View>
            <ProgressRing
              progress={todayProgress}
              size={72}
              strokeWidth={6}
              color={colors.primary}
            />
          </View>
        </GlassCard>
      </Animated.View>

      {/* Motivational Quote */}
      <MotivationalQuote />
      {/* Search */}
      <View style={{ marginTop: sp.lg }}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* Filters */}
      <View style={{ marginTop: sp.md }}>
        <TaskFilters
          status={filters.status}
          category={filters.category}
          sortBy={filters.sortBy}
          onStatusChange={(s) => setFilters({ status: s })}
          onCategoryChange={(c) => setFilters({ category: c })}
          onSortChange={(s) => setFilters({ sortBy: s })}
        />
      </View>

      {/* Task Sections */}
      <View style={{ marginTop: sp.md }}>
        {hasNoTasks ? (
          <EmptyState
            icon="rocket-outline"
            title="No tasks yet"
            subtitle="Create your first task and start being productive!"
            actionLabel="Create Task"
            onAction={() => router.push('/task/create' as any)}
          />
        ) : hasNoFilteredTasks && filteredCompleted.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No tasks found"
            subtitle="Try adjusting your filters or search query"
          />
        ) : (
          <>
            {renderSection('Overdue', filteredOverdue, 'alert-circle', colors.danger)}
            {renderSection('Today', filteredToday, 'today', colors.primary)}
            {renderSection('Upcoming', filteredUpcoming, 'calendar', colors.info)}
            {filters.status !== 'active' &&
              filteredCompleted.length > 0 &&
              renderSection('Completed', filteredCompleted, 'checkmark-done', colors.success, () => {
                useTaskStore.getState().clearCompletedTasks();
              })}
          </>
        )}
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {themeBackgrounds[themeFlavor] ? (
        <ImageBackground
          source={themeBackgrounds[themeFlavor]}
          style={{ flex: 1 }}
          imageStyle={{ opacity: 0.15, resizeMode: 'cover' }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingTop: insets.top + 12,
              paddingBottom: 100,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            decelerationRate={Platform.OS === 'android' ? 0.985 : 'normal'}
            overScrollMode="never"
          >
            <Header subtitle={`${totalActive} tasks remaining`} />
            {renderContent()}
          </ScrollView>
        </ImageBackground>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 12,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          decelerationRate={Platform.OS === 'android' ? 0.985 : 'normal'}
          overScrollMode="never"
        >
          <Header subtitle={`${totalActive} tasks remaining`} />
          {renderContent()}
        </ScrollView>
      )}

      <FAB onPress={() => router.push('/task/create' as any)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  progressCard: {
    padding: 20,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});
