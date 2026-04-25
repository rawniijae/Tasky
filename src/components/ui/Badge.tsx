import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';

type BadgeVariant = 'default' | 'priority' | 'category' | 'status';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({
  label,
  color,
  backgroundColor,
  icon,
  size = 'sm',
  style,
}: BadgeProps) {
  const { colors, typography: t, spacing: sp, borderRadius: br } = useTheme();

  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || colors.backgroundSecondary,
          borderRadius: br.full,
          paddingHorizontal: isSm ? sp.sm : sp.md,
          paddingVertical: isSm ? 3 : 5,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSm ? 12 : 14}
          color={color || colors.textSecondary}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          isSm ? t.caption : t.labelSmall,
          { color: color || colors.textSecondary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
