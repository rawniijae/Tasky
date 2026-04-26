import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { AnimatedCheckbox } from '@/src/components/ui/AnimatedCheckbox';
import { Badge } from '@/src/components/ui/Badge';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { SwipeableRow } from '@/src/components/ui/SwipeableRow';
import type { Task } from '@/src/types';
import { CATEGORIES, PRIORITY_LABELS } from '@/src/types';
import { formatRelativeDate, isOverdue } from '@/src/utils/dates';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
  index?: number;
  isSelected?: boolean;
  selectionMode?: boolean;
  onLongPress?: () => void;
}

export function TaskCard({
  task,
  onPress,
  onToggle,
  onDelete,
  index = 0,
  isSelected = false,
  selectionMode = false,
  onLongPress,
}: TaskCardProps) {
  const { colors, typography: t, spacing: sp, borderRadius: br, priorityColors: pc, isDark } = useTheme();

  const category = CATEGORIES.find((c) => c.id === task.category);
  const pColor = pc[task.priority];
  const overdue = !task.completed && task.dueDate ? isOverdue(task.dueDate) : false;

  const subtaskProgress =
    task.subtasks.length > 0
      ? task.subtasks.filter((st) => st.completed).length / task.subtasks.length
      : 0;

  const titleStyle = useAnimatedStyle(() => ({
    textDecorationLine: task.completed ? 'line-through' : 'none',
    opacity: withTiming(task.completed ? 0.5 : 1, { duration: 150 }),
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(200)}
    >


      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={200}
        style={[
          styles.card,
          {
            backgroundColor: isSelected ? colors.primary + '20' : colors.cardBg,
            borderColor: isSelected ? colors.primary : colors.cardBorder,
            borderRadius: br.xl,
            borderLeftColor: isSelected ? colors.primary : pColor.accent,
            borderLeftWidth: 3,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.topRow}>
            {selectionMode ? (
              <View style={{ justifyContent: 'center', alignItems: 'center', width: 22, height: 22 }}>
                <Ionicons 
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                  size={22} 
                  color={isSelected ? colors.primary : colors.textTertiary} 
                />
              </View>
            ) : (
              <AnimatedCheckbox
                checked={task.completed}
                onToggle={onToggle}
                color={pColor.accent}
                size={22}
              />
            )}
            <View style={styles.titleContainer}>
              <Animated.Text
                style={[t.titleSmall, { color: colors.text }, titleStyle]}
                numberOfLines={1}
              >
                {task.title}
              </Animated.Text>
              {task.description ? (
                <Text
                  style={[
                    t.bodySmall,
                    { color: colors.textTertiary, marginTop: 2 },
                  ]}
                  numberOfLines={1}
                >
                  {task.description}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Meta row */}
          <View style={styles.metaRow}>
            {category && (
              <Badge
                label={category.label}
                icon={category.icon as any}
                color={category.color}
                backgroundColor={
                  isDark
                    ? `${category.color}20`
                    : `${category.color}15`
                }
              />
            )}
            <Badge
              label={PRIORITY_LABELS[task.priority]}
              color={pColor.text}
              backgroundColor={pColor.bg}
              size="sm"
            />
            {task.dueDate && (
              <Badge
                label={formatRelativeDate(task.dueDate)}
                icon={overdue ? 'alert-circle' : 'calendar-outline'}
                color={overdue ? colors.danger : colors.textSecondary}
                backgroundColor={
                  overdue
                    ? isDark
                      ? 'rgba(244,63,94,0.15)'
                      : '#FEE2E2'
                    : colors.backgroundSecondary
                }
                size="sm"
              />
            )}
          </View>

          {/* Subtask progress */}
          {task.subtasks.length > 0 && (
            <View style={styles.subtaskRow}>
              <ProgressBar
                progress={subtaskProgress}
                height={4}
                style={{ flex: 1 }}
              />
              <Text
                style={[
                  t.caption,
                  { color: colors.textTertiary, marginLeft: sp.sm },
                ]}
              >
                {task.subtasks.filter((st) => st.completed).length}/
                {task.subtasks.length}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: 'hidden',
  },
  content: {
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    paddingTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginLeft: 34,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 34,
  },
});
