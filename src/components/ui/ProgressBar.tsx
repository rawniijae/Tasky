import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/theme/ThemeProvider';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 6,
  color,
  backgroundColor,
  animated = true,
  style,
}: ProgressBarProps) {
  const { colors, borderRadius: br } = useTheme();
  const widthAnim = useSharedValue(0);

  React.useEffect(() => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    if (animated) {
      widthAnim.value = withTiming(clampedProgress, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      widthAnim.value = clampedProgress;
    }
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value * 100}%` as any,
  }));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: backgroundColor || colors.backgroundTertiary,
          borderRadius: br.full,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.bar, { borderRadius: br.full }, barStyle]}>
        <LinearGradient
          colors={[color || colors.gradientStart, color || colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: br.full }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    overflow: 'hidden',
  },
});
