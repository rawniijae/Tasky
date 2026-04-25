import React, { useState, useCallback } from 'react';
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
import { useRouter } from 'expo-router';

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
import type { CategoryId, Priority, RecurrenceRule, Subtask } from '@/src/types';

export default function CreateTaskScreen() {
  const { colors, typography: t, spacing: sp } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();
  const addTask = useTaskStore((s) => s.addTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId>('personal');
  const [priority, setPriority] = useState<Priority>('p3');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [dueTime, setDueTime] = useState<string | undefined>(undefined);
  const [recurrence, setRecurrence] = useState<RecurrenceRule>({ type: 'none' });
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtask: Subtask = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: newSubtask.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, subtask]);
    setNewSubtask('');
    haptics.light();
  };

  const handleSave = () => {
    if (!title.trim()) {
      haptics.warning();
      Alert.alert('Missing Title', 'Please enter a task title.');
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate,
      dueTime,
      subtasks,
      recurrence,
      reminderMinutes: 10, // Notify 10 minutes before
    });

    haptics.success();
    router.back();
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton
          icon="close"
          onPress={() => router.back()}
          color={colors.textSecondary}
        />
        <Text style={[t.titleLarge, { color: colors.text }]}>New Task</Text>
        <Button title="Save" onPress={handleSave} size="sm" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={{ paddingHorizontal: 16, marginTop: sp.md }}>
          <Input
            placeholder="What needs to be done?"
            value={title}
            onChangeText={setTitle}
            icon="create-outline"
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={{ paddingHorizontal: 16, marginTop: sp.md }}>
          <Input
            placeholder="Add description..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            icon="document-text-outline"
          />
        </View>

        {/* Category */}
        <View style={{ marginTop: sp.xl }}>
          <Text
            style={[
              t.labelMedium,
              { color: colors.textSecondary, marginBottom: sp.sm, paddingHorizontal: 20 },
            ]}
          >
            Category
          </Text>
          <CategoryPicker selected={category} onSelect={setCategory} />
        </View>

        {/* Priority */}
        <View style={{ marginTop: sp.xl }}>
          <Text
            style={[
              t.labelMedium,
              { color: colors.textSecondary, marginBottom: sp.sm, paddingHorizontal: 20 },
            ]}
          >
            Priority
          </Text>
          <PriorityPicker selected={priority} onSelect={setPriority} />
        </View>

        {/* Date & Time */}
        <View style={{ marginTop: sp.xl }}>
          <DateTimePicker
            dueDate={dueDate}
            dueTime={dueTime}
            recurrence={recurrence}
            onDateChange={setDueDate}
            onTimeChange={setDueTime}
            onRecurrenceChange={setRecurrence}
          />
        </View>


        {/* Subtasks */}
        <View style={{ marginTop: sp.xl, paddingHorizontal: 16 }}>
          <Text
            style={[
              t.labelMedium,
              { color: colors.textSecondary, marginBottom: sp.sm, marginLeft: sp.xs },
            ]}
          >
            Subtasks
          </Text>
          {subtasks.map((st) => (
            <SubtaskItem
              key={st.id}
              subtask={st}
              onToggle={() => {
                setSubtasks(
                  subtasks.map((s) =>
                    s.id === st.id ? { ...s, completed: !s.completed } : s
                  )
                );
              }}
              onDelete={() => {
                setSubtasks(subtasks.filter((s) => s.id !== st.id));
              }}
              onUpdate={(title) => {
                setSubtasks(
                  subtasks.map((s) =>
                    s.id === st.id ? { ...s, title } : s
                  )
                );
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
