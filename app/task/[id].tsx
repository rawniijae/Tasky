import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useTaskStore } from '@/src/stores/taskStore';
import { useHaptics } from '@/src/hooks/useHaptics';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { IconButton } from '@/src/components/ui/IconButton';
import { CategoryPicker } from '@/src/components/task/CategoryPicker';
import { PriorityPicker } from '@/src/components/task/PriorityPicker';
import { DateTimePicker } from '@/src/components/task/DateTimePicker';
import { SubtaskItem } from '@/src/components/task/SubtaskItem';
import type { Task, Subtask } from '@/src/types';

export default function TaskDetailScreen() {
  const { colors, typography: t, spacing: sp } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const haptics = useHaptics();

  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const deleteSubtask = useTaskStore((s) => s.deleteSubtask);

  const originalTask = tasks.find((t) => t.id === id);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (originalTask && !editedTask) {
      setEditedTask({ ...originalTask });
    }
  }, [originalTask]);

  if (!originalTask || !editedTask) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <IconButton icon="arrow-back" onPress={() => router.back()} />
          <Text style={[t.titleLarge, { color: colors.text }]}>Not Found</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[t.bodyMedium, { color: colors.textTertiary }]}>
            Task not found
          </Text>
        </View>
      </View>
    );
  }

  const handleSave = () => {
    if (!editedTask.title.trim()) {
      haptics.warning();
      Alert.alert('Missing Title', 'Please enter a task title.');
      return;
    }

    updateTask(originalTask.id, editedTask);
    haptics.success();
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
         text: 'Delete',
         style: 'destructive',
         onPress: () => {
           haptics.warning();
           deleteTask(originalTask.id);
           router.back();
         },
      },
    ]);
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtask: Subtask = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: newSubtask.trim(),
      completed: false,
    };
    setEditedTask({
      ...editedTask,
      subtasks: [...editedTask.subtasks, subtask],
    });
    setNewSubtask('');
    haptics.light();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton icon="arrow-back" onPress={() => router.back()} />
        <Text style={[t.titleLarge, { color: colors.text }]} numberOfLines={1}>
          Edit Task
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconButton
            icon="trash-outline"
            onPress={handleDelete}
            color={colors.danger}
          />
          <Button title="Save" onPress={handleSave} size="sm" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status Toggle */}
        <Animated.View entering={FadeIn.delay(50)} style={{ paddingHorizontal: 16, marginTop: sp.md }}>
          <Button
            title={editedTask.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
            icon={editedTask.completed ? 'arrow-undo' : 'checkmark-circle'}
            variant={editedTask.completed ? 'secondary' : 'primary'}
            onPress={() => {
              setEditedTask({ ...editedTask, completed: !editedTask.completed });
            }}
            fullWidth
          />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={{ paddingHorizontal: 16, marginTop: sp.xl }}>
          <Input
            label="Title"
            value={editedTask.title}
            onChangeText={(text) => setEditedTask({ ...editedTask, title: text })}
            icon="create-outline"
          />
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(150).duration(300)} style={{ paddingHorizontal: 16, marginTop: sp.md }}>
          <Input
            label="Description"
            value={editedTask.description}
            onChangeText={(text) =>
              setEditedTask({ ...editedTask, description: text })
            }
            multiline
            numberOfLines={3}
            icon="document-text-outline"
          />
        </Animated.View>

        {/* Category */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)} style={{ marginTop: sp.xl }}>
          <Text
            style={[
              t.labelMedium,
              { color: colors.textSecondary, marginBottom: sp.sm, paddingHorizontal: 20 },
            ]}
          >
            Category
          </Text>
          <CategoryPicker
            selected={editedTask.category}
            onSelect={(cat) => setEditedTask({ ...editedTask, category: cat })}
          />
        </Animated.View>

        {/* Priority */}
        <Animated.View entering={FadeInDown.delay(250).duration(300)} style={{ marginTop: sp.xl }}>
          <Text
            style={[
              t.labelMedium,
              { color: colors.textSecondary, marginBottom: sp.sm, paddingHorizontal: 20 },
            ]}
          >
            Priority
          </Text>
          <PriorityPicker
            selected={editedTask.priority}
            onSelect={(p) => setEditedTask({ ...editedTask, priority: p })}
          />
        </Animated.View>

        {/* Date & Recurrence */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)} style={{ marginTop: sp.xl }}>
          <DateTimePicker
            dueDate={editedTask.dueDate}
            dueTime={editedTask.dueTime}
            recurrence={editedTask.recurrence}
            onDateChange={(date) => setEditedTask({ ...editedTask, dueDate: date })}
            onTimeChange={(time) => setEditedTask({ ...editedTask, dueTime: time })}
            onRecurrenceChange={(rec) =>
              setEditedTask({ ...editedTask, recurrence: rec })
            }
          />
        </Animated.View>

        {/* Subtasks */}
        <Animated.View entering={FadeInDown.delay(350).duration(300)} style={{ marginTop: sp.xl, paddingHorizontal: 16 }}>
          <Text
            style={[
              t.labelMedium,
              { color: colors.textSecondary, marginBottom: sp.sm, marginLeft: sp.xs },
            ]}
          >
            Subtasks ({editedTask.subtasks.filter((s) => s.completed).length}/{editedTask.subtasks.length})
          </Text>
          {editedTask.subtasks.map((st) => (
            <SubtaskItem
              key={st.id}
              subtask={st}
              onToggle={() => {
                setEditedTask({
                  ...editedTask,
                  subtasks: editedTask.subtasks.map((s) =>
                    s.id === st.id ? { ...s, completed: !s.completed } : s
                  ),
                });
              }}
              onDelete={() => {
                setEditedTask({
                  ...editedTask,
                  subtasks: editedTask.subtasks.filter((s) => s.id !== st.id),
                });
              }}
              onUpdate={(title) => {
                setEditedTask({
                  ...editedTask,
                  subtasks: editedTask.subtasks.map((s) =>
                    s.id === st.id ? { ...s, title } : s
                  ),
                });
              }}
            />
          ))}
          <View style={styles.addSubtaskRow}>
            <TextInput
              value={newSubtask}
              onChangeText={setNewSubtask}
              placeholder="Add subtask..."
              placeholderTextColor={colors.placeholder}
              onSubmitEditing={handleAddSubtask}
              returnKeyType="done"
              style={[
                styles.subtaskInput,
                t.bodySmall,
                {
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  borderRadius: 10,
                },
              ]}
            />
            <IconButton
              icon="add-circle"
              onPress={handleAddSubtask}
              color={colors.primary}
              size={24}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  subtaskInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
});
