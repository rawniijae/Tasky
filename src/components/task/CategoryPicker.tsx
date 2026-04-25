import React from 'react';
import { ScrollView, Pressable, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';
import { CATEGORIES } from '@/src/types';
import type { CategoryId } from '@/src/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CategoryPickerProps {
  selected: CategoryId;
  onSelect: (id: CategoryId) => void;
}

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  const { colors, typography: t, spacing: sp, borderRadius: br } = useTheme();
  const haptics = useHaptics();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat.id;
        return (
          <Pressable
            key={cat.id}
            onPress={() => {
              haptics.selection();
              onSelect(cat.id);
            }}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? `${cat.color}20`
                  : colors.backgroundSecondary,
                borderColor: isSelected ? cat.color : colors.border,
                borderRadius: br.full,
              },
            ]}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={isSelected ? cat.color : colors.textTertiary}
            />
            <Text
              style={[
                t.labelSmall,
                {
                  color: isSelected ? cat.color : colors.textSecondary,
                  marginLeft: 6,
                },
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
});
