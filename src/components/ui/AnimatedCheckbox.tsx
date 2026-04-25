import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  color?: string;
}

export function AnimatedCheckbox({
  checked,
  onToggle,
  size = 24,
  color,
}: AnimatedCheckboxProps) {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const progress = useSharedValue(checked ? 1 : 0);
  const scaleAnim = useSharedValue(1);

  const accentColor = color || colors.primary;

  React.useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 200 });
  }, [checked]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      borderColor: interpolateColor(
        progress.value,
        [0, 1],
        [colors.border, accentColor]
      ),
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ['transparent', accentColor]
      ),
    };
  });

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  const handlePress = () => {
    // Quick, snappy scale — just one bounce, no jiggle
    scaleAnim.value = withSequence(
      withTiming(0.9, { duration: 60 }),
      withSpring(1, { damping: 20, stiffness: 400 })
    );
    if (!checked) {
      haptics.success();
    } else {
      haptics.light();
    }
    onToggle();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          borderWidth: 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        containerStyle,
      ]}
      hitSlop={8}
    >
      <Animated.View style={checkStyle}>
        <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
          <Path
            d="M20 6L9 17L4 12"
            stroke="#FFFFFF"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </AnimatedPressable>
  );
}
