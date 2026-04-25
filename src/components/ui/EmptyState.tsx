import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon = 'checkmark-done-circle-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors, typography: t, spacing: sp } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={[styles.container, style]}
    >
      <Animated.View entering={SlideInUp.delay(100).springify()}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Ionicons name={icon} size={48} color={colors.textTertiary} />
        </View>
      </Animated.View>
      <Text style={[t.titleMedium, { color: colors.text, marginTop: sp.lg }]}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            t.bodySmall,
            {
              color: colors.textTertiary,
              marginTop: sp.sm,
              textAlign: 'center',
              maxWidth: 260,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: sp.xl }}>
          <Button title={actionLabel} onPress={onAction} icon="add" size="md" />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
