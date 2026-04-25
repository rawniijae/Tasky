import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { AnimatedCheckbox } from '@/src/components/ui/AnimatedCheckbox';
import { IconButton } from '@/src/components/ui/IconButton';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { Subtask } from '@/src/types';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (title: string) => void;
}

export function SubtaskItem({
  subtask,
  onToggle,
  onDelete,
  onUpdate,
}: SubtaskItemProps) {
  const { colors, typography: t, spacing: sp } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.springify()}
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderRadius: 10,
        },
      ]}
    >
      <AnimatedCheckbox
        checked={subtask.completed}
        onToggle={onToggle}
        size={18}
      />
      <Text
        style={[
          t.bodySmall,
          {
            flex: 1,
            color: subtask.completed ? colors.textTertiary : colors.text,
            textDecorationLine: subtask.completed ? 'line-through' : 'none',
            marginLeft: sp.sm,
          },
        ]}
        numberOfLines={2}
      >
        {subtask.title}
      </Text>
      <IconButton
        icon="close-circle-outline"
        size={16}
        color={colors.textTertiary}
        onPress={onDelete}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 2,
  },
});
