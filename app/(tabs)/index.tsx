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
import { UpdateBanner } from '@/src/components/ui/UpdateBanner';
import { BroadcastBanner } from '@/src/components/ui/BroadcastBanner';
import { syncUpdateStatus } from '@/src/utils/updateChecker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeOutDown } from 'react-native-reanimated';
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
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const isSelectionMode = selectedTaskIds.size > 0;

  const tasks = useTaskStore((s) => s.tasks);
  const filters = useTaskStore((s) => s.filters);
  const setFilters = useTaskStore((s) => s.setFilters);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const addXPForTask = useGamificationStore((s) => s.addXPForTask);
  const updateStreak = useGamificationStore((s) => s.updateStreak);
  const checkAchievements = useGamificationStore((s) => s.checkAchievements);

  // Check for updates on mount
  useEffect(() => {
    syncUpdateStatus();
  }, []);

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
  const overdue = React.useMemo(() => {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).getTime() < startOfToday)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [tasks]);

  const priorityOrder = { p1: 1, p2: 2, p3: 3, p4: 4 };

  const today = React.useMemo(() => {
    const start = new Date().setHours(0, 0, 0, 0);
    const end = new Date().setHours(23, 59, 59, 999);
    return tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const d = new Date(t.dueDate).getTime();
      return d >= start && d <= end;
    })
    .sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] || 5) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 5));
  }, [tasks]);

  const upcoming = React.useMemo(() => {
    const endOfToday = new Date().setHours(23, 59, 59, 999);
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
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false;
      // Must be completed today
      const isDoneToday = new Date(t.completedAt).getTime() >= startOfToday;
      if (!isDoneToday) return false;
      
      // AND it must have been due today or overdue
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate).getTime();
      const endOfToday = new Date().setHours(23, 59, 59, 999);
      return dueDate <= endOfToday;
    }).length;
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

  const progressStats = React.useMemo(() => {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    
    // 1. Get tasks completed today
    const doneToday = tasks.filter(t => 
      t.completed && t.completedAt && new Date(t.completedAt).getTime() >= startOfToday
    );

    // 2. Get ALL active tasks (not just today) to make the box more useful
    const activeTasks = tasks.filter(t => !t.completed);

    const total = doneToday.length + activeTasks.length;
    const done = doneToday.length;
    
    return {
      total,
      done,
      remaining: activeTasks.length,
      percent: total > 0 ? done / total : 0
    };
  }, [tasks]);

  const todayTotal = progressStats.remaining;
  const todayProgress = progressStats.percent;

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
                  "Clear Active Tasks",
                  "Are you sure you want to delete all active tasks? This cannot be undone.",
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
            selectionMode={isSelectionMode}
            isSelected={selectedTaskIds.has(task.id)}
            onLongPress={() => {
              haptics.selection();
              setSelectedTaskIds(new Set([task.id]));
            }}
            onPress={() => {
              if (isSelectionMode) {
                haptics.selection();
                const newSet = new Set(selectedTaskIds);
                if (newSet.has(task.id)) newSet.delete(task.id);
                else newSet.add(task.id);
                setSelectedTaskIds(newSet);
              } else {
                router.push(`/task/${task.id}` as any);
              }
            }}
            onToggle={() => {
              if (isSelectionMode) return;
              handleToggleTask(task);
            }}
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
      <UpdateBanner />
      <BroadcastBanner />
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
                  {progressStats.done} done
                </Text>
                <Text style={[t.caption, { color: colors.textTertiary, marginTop: 2 }]}>
                  {progressStats.remaining} {progressStats.remaining === 1 ? 'task' : 'tasks'} remaining
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
            {renderSection('Today', filteredToday, 'today', colors.primary, () => {
              useTaskStore.getState().clearActiveTasks();
            })}
            {renderSection('Upcoming', filteredUpcoming, 'calendar', colors.info)}
          </>
        )}
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {themeBackgrounds[themeFlavor] ? (
        <ImageBackground
          source={themeBackgrounds[themeFlavor]}
          style={{ flex: 1 }}
          imageStyle={{ opacity: 0.15, resizeMode: 'cover' }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingTop: 12,
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
            <Header showWeather />
            {renderContent()}
          </ScrollView>
        </ImageBackground>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingTop: 12,
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
          <Header subtitle={`${totalActive} tasks remaining`} showWeather />
          {renderContent()}
        </ScrollView>
      )}

      <FAB onPress={() => router.push('/task/create' as any)} />

      {isSelectionMode && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutDown}
          style={{
            position: 'absolute',
            top: insets.top + 10,
            left: 16,
            right: 16,
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: colors.border,
            zIndex: 999,
          }}
        >
          <Text style={[t.titleMedium, { color: colors.text, flex: 1 }]}>
            {selectedTaskIds.size} Selected
          </Text>
          <Pressable
            onPress={() => setSelectedTaskIds(new Set())}
            style={{ marginRight: 16 }}
          >
            <Text style={[t.labelMedium, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Alert.alert('Delete', `Delete ${selectedTaskIds.size} tasks?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete', style: 'destructive', onPress: () => {
                    const state = useTaskStore.getState();
                    selectedTaskIds.forEach(id => state.deleteTask(id));
                    setSelectedTaskIds(new Set());
                    haptics.success();
                  }
                }
              ]);
            }}
            style={{ marginRight: 16 }}
          >
            <Text style={[t.labelMedium, { color: colors.danger }]}>Delete</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Alert.alert('Delete All', `Delete ALL active tasks?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete All', style: 'destructive', onPress: () => {
                    useTaskStore.getState().clearActiveTasks();
                    setSelectedTaskIds(new Set());
                    haptics.success();
                  }
                }
              ]);
            }}
          >
            <Text style={[t.labelMedium, { color: colors.danger }]}>Delete All</Text>
          </Pressable>
        </Animated.View>
      )}
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
