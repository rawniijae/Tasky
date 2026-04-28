import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

// Drastically reduced rain count for performance
const RAIN_COUNT = 10;

// ─── Rain Drop (GPU-only, no JS state) ───────────────────────
const RainDrop = React.memo(({ index }: { index: number }) => {
  const { isDark } = useTheme();
  const progress = useSharedValue(0);

  const x     = useMemo(() => Math.random() * width, []);
  const dur   = useMemo(() => 1800 + Math.random() * 1200, []);
  const delay = useMemo(() => Math.random() * 3000, []);
  const len   = useMemo(() => 14 + Math.random() * 12, []);
  const tilt  = useMemo(() => 8 + Math.random() * 6, []);
  const alpha = useMemo(() => (isDark ? 0.3 : 0.4) * (0.5 + Math.random() * 0.5), [isDark]);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: dur, easing: Easing.linear }),
        -1,
        false
      )
    );
    return () => cancelAnimation(progress);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.08, 0.88, 1],
      [0, alpha, alpha, 0]
    ),
    transform: [
      { translateX: x + progress.value * (tilt * 4) },
      { translateY: progress.value * (height + len + 40) - len - 20 },
      { rotate: `${tilt}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.drop,
        {
          height: len,
          backgroundColor: isDark
            ? 'rgba(100,220,255,0.9)'
            : 'rgba(0,160,220,0.85)',
        },
        style,
      ]}
    />
  );
});

export const WaterDroplets = React.memo(() => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {Array.from({ length: RAIN_COUNT }).map((_, i) => (
      <RainDrop key={i} index={i} />
    ))}
  </View>
));

// ─── Simple shimmer wave (GPU-only, no SVG, no requestAnimationFrame) ─────
const WaveShimmer = React.memo(({ color, opacity, speed, offsetY }: {
  color: string;
  opacity: number;
  speed: number;
  offsetY: number;
}) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-width, { duration: speed, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(translateX);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          bottom: offsetY,
          backgroundColor: color,
          opacity,
          height: 3,
          borderRadius: 1.5,
        },
        animStyle,
      ]}
      pointerEvents="none"
    />
  );
});

// Lightweight replacement for the old SVG wave monster
// Just 2 subtle moving shimmer lines — zero SVG, zero setState, 100% GPU
export const WaterWaves = React.memo(() => {
  const { colors } = useTheme();
  return (
    <>
      <WaveShimmer color={colors.primary} opacity={0.08} speed={8000} offsetY={4} />
      <WaveShimmer color={colors.primaryLight} opacity={0.05} speed={12000} offsetY={12} />
    </>
  );
});

// ─── Ripple on tap ────────────────────────────────────────────
interface Ripple {
  id: number;
  x: number;
  y: number;
}

function RippleCircle({
  ripple,
  onComplete,
  color,
}: {
  ripple: Ripple;
  onComplete: () => void;
  color: string;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      1,
      { duration: 1000, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished) runOnJS(onComplete)();
      }
    );
  }, []);

  const ring1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: ripple.x - 30 },
      { translateY: ripple.y - 30 },
      { scale: interpolate(progress.value, [0, 1], [0.1, 2]) },
    ],
    opacity: interpolate(progress.value, [0, 0.3, 1], [0.4, 0.25, 0]),
  }));

  return (
    <Animated.View
      style={[
        styles.ripple,
        { borderColor: color, width: 60, height: 60, borderRadius: 30 },
        ring1,
      ]}
    />
  );
}

export const WaterRippleOverlay = React.memo(() => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const { colors } = useTheme();

  const handlePress = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    setRipples((prev) => [...prev.slice(-2), { id: Date.now(), x: locationX, y: locationY }]);
  };

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={handlePress}
      pointerEvents="box-none"
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {ripples.map((ripple) => (
          <RippleCircle
            key={ripple.id}
            ripple={ripple}
            onComplete={() => removeRipple(ripple.id)}
            color={colors.primary}
          />
        ))}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  drop: {
    position: 'absolute',
    width: 1.4,
    borderRadius: 1,
  },
  shimmer: {
    position: 'absolute',
    left: 0,
    width: width * 2,
  },
  ripple: {
    position: 'absolute',
    borderWidth: 1.4,
  },
});
