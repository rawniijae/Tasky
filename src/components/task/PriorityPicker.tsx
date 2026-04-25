import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';
import type { Priority } from '@/src/types';
import { PRIORITY_LABELS } from '@/src/types';

interface PriorityPickerProps {
  selected: Priority;
  onSelect: (p: Priority) => void;
}

const priorities: Priority[] = ['p1', 'p2', 'p3', 'p4'];
const priorityIcons: Record<Priority, keyof typeof Ionicons.glyphMap> = {
  p1: 'flag',
  p2: 'flag',
  p3: 'flag-outline',
  p4: 'flag-outline',
};

export function PriorityPicker({ selected, onSelect }: PriorityPickerProps) {
  const { colors, typography: t, spacing: sp, borderRadius: br, priorityColors: pc } = useTheme();
  const haptics = useHaptics();

  return (
    <View style={styles.container}>
      {priorities.map((p) => {
        const isSelected = selected === p;
        const pColor = pc[p];
        return (
          <Pressable
            key={p}
            onPress={() => {
              haptics.selection();
              onSelect(p);
            }}
            style={[
              styles.item,
              {
                backgroundColor: isSelected ? pColor.bg : colors.backgroundSecondary,
                borderColor: isSelected ? pColor.accent : colors.border,
                borderRadius: br.lg,
              },
            ]}
          >
            <Ionicons
              name={priorityIcons[p]}
              size={16}
              color={isSelected ? pColor.accent : colors.textTertiary}
            />
            <Text
              style={[
                t.labelSmall,
                {
                  color: isSelected ? pColor.text : colors.textSecondary,
                  marginTop: 4,
                },
              ]}
            >
              {PRIORITY_LABELS[p]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
  },
});
