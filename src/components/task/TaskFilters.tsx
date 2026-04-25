import React from 'react';
import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';
import type { FilterStatus, CategoryId, Priority, SortBy } from '@/src/types';
import { CATEGORIES, PRIORITY_LABELS } from '@/src/types';

interface TaskFiltersProps {
  status: FilterStatus;
  category: CategoryId | 'all';
  sortBy: SortBy;
  onStatusChange: (s: FilterStatus) => void;
  onCategoryChange: (c: CategoryId | 'all') => void;
  onSortChange: (s: SortBy) => void;
}

const statusOptions: { label: string; value: FilterStatus; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'All', value: 'all', icon: 'apps-outline' },
  { label: 'Active', value: 'active', icon: 'radio-button-on-outline' },
  { label: 'Done', value: 'completed', icon: 'checkmark-done-outline' },
  { label: 'Overdue', value: 'overdue', icon: 'alert-circle-outline' },
];

export function TaskFilters({
  status,
  category,
  sortBy,
  onStatusChange,
  onCategoryChange,
  onSortChange,
}: TaskFiltersProps) {
  const { colors, typography: t, borderRadius: br } = useTheme();
  const haptics = useHaptics();

  const renderChip = (
    key: string,
    label: string,
    isSelected: boolean,
    onPress: () => void,
    icon?: keyof typeof Ionicons.glyphMap
  ) => (
    <Pressable
      key={key}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected
            ? `${colors.primary}15`
            : colors.backgroundSecondary,
          borderColor: isSelected ? colors.primary : 'transparent',
          borderRadius: br.full,
        },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={isSelected ? colors.primary : colors.textTertiary}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          t.labelSmall,
          { color: isSelected ? colors.primary : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {statusOptions.map((opt) =>
        renderChip(opt.value, opt.label, status === opt.value, () =>
          onStatusChange(opt.value), opt.icon
        )
      )}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      {renderChip('cat-all', 'All', category === 'all', () => onCategoryChange('all'))}
      {CATEGORIES.slice(0, 4).map((cat) =>
        renderChip(
          `cat-${cat.id}`,
          cat.label,
          category === cat.id,
          () => onCategoryChange(cat.id),
          cat.icon as any
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  divider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
});
