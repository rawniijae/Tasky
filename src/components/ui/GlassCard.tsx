import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  animate?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 40,
  animate = true,
  delay = 0,
}: GlassCardProps) {
  const { colors, borderRadius: br } = useTheme();

  return (
    <Animated.View
      entering={animate ? FadeIn.delay(delay).duration(300) : undefined}
      exiting={animate ? FadeOut.duration(150) : undefined}
      style={[
        styles.container,
        {
          borderRadius: br.xl,
          borderColor: colors.glassBorder,
          backgroundColor: colors.glassBg,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
});
