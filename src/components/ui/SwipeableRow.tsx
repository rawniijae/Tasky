import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';

const SWIPE_THRESHOLD = 80;

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeRight?: () => void; // complete
  onSwipeLeft?: () => void; // delete
  rightLabel?: string;
  leftLabel?: string;
  rightColor?: string;
  leftColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  enabled?: boolean;
}

export function SwipeableRow({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = 'Done',
  leftLabel = 'Delete',
  rightColor,
  leftColor,
  rightIcon = 'checkmark-circle',
  leftIcon = 'trash',
  enabled = true,
}: SwipeableRowProps) {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const translateX = useSharedValue(0);
  const hasTriggeredHaptic = useSharedValue(false);

  const rColor = rightColor || colors.success;
  const lColor = leftColor || colors.danger;

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;

      // Haptic at threshold
      if (
        Math.abs(e.translationX) > SWIPE_THRESHOLD &&
        !hasTriggeredHaptic.value
      ) {
        hasTriggeredHaptic.value = true;
        runOnJS(haptics.medium)();
      }
      if (
        Math.abs(e.translationX) < SWIPE_THRESHOLD &&
        hasTriggeredHaptic.value
      ) {
        hasTriggeredHaptic.value = false;
      }
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD && onSwipeRight) {
        translateX.value = withTiming(300, { duration: 200 });
        runOnJS(onSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD && onSwipeLeft) {
        translateX.value = withTiming(-300, { duration: 200 });
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
      hasTriggeredHaptic.value = false;
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0.5],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  const rightBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 10], [0, 1], Extrapolation.CLAMP),
  }));

  const leftBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-10, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.container}>
      {/* Right swipe action (complete) */}
      <Animated.View style={[styles.actionContainer, styles.rightAction, { backgroundColor: rColor }, rightBgStyle]}>
        <Animated.View style={[styles.actionContent, rightActionStyle]}>
          <Ionicons name={rightIcon} size={24} color="#FFF" />
          <Text style={styles.actionText}>{rightLabel}</Text>
        </Animated.View>
      </Animated.View>

      {/* Left swipe action (delete) */}
      <Animated.View style={[styles.actionContainer, styles.leftAction, { backgroundColor: lColor }, leftBgStyle]}>
        <Animated.View style={[styles.actionContent, leftActionStyle]}>
          <Ionicons name={leftIcon} size={24} color="#FFF" />
          <Text style={styles.actionText}>{leftLabel}</Text>
        </Animated.View>
      </Animated.View>

      {/* Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  actionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  rightAction: {
    alignItems: 'flex-start',
    paddingLeft: 24,
  },
  leftAction: {
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  actionContent: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
