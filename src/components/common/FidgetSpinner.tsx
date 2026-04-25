import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassCard } from '../ui/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPINNER_SIZE = 180;
const MAX_VELOCITY = 120;
const PARTICLE_COUNT = 16;

type SpinnerType = 'classic' | 'galaxy' | 'star';

const SPINNER_OPTIONS: { type: SpinnerType; label: string; emoji: string }[] = [
  { type: 'classic', label: 'Classic', emoji: '🔵' },
  { type: 'galaxy', label: 'Galaxy', emoji: '🌌' },
  { type: 'star', label: 'Nova', emoji: '⭐' },
];

// ─── Spark Particle ───────────────────────────────────────────
const SparkParticle = ({
  index,
  rotation,
  velocity,
  primaryColor,
  accentColor,
  arms,
}: {
  index: number;
  rotation: Animated.SharedValue<number>;
  velocity: Animated.SharedValue<number>;
  primaryColor: string;
  accentColor: string;
  arms: number;
}) => {
  const sparkStyle = useAnimatedStyle(() => {
    const v = velocity.value;
    if (v < 3) return { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }] };

    const armIndex = index % arms;
    const armAngle = rotation.value + armIndex * (360 / arms);
    const rad = (armAngle * Math.PI) / 180;
    const life = ((rotation.value * 0.7 + index * (360 / PARTICLE_COUNT)) % 100) / 100;
    const baseRadius = SPINNER_SIZE / 2.4;
    const distance = baseRadius + life * v * 2.2;

    return {
      opacity: interpolate(v, [5, 30], [0, 1], Extrapolate.CLAMP) * (1 - life * 0.8),
      transform: [
        { translateX: Math.cos(rad) * distance },
        { translateY: Math.sin(rad) * distance },
        { scale: interpolate(v, [5, MAX_VELOCITY], [0.4, 1.6], Extrapolate.CLAMP) * (1 - life * 0.6) },
      ],
      backgroundColor: index % 3 === 0 ? '#FFD600' : index % 3 === 1 ? primaryColor : accentColor,
      borderRadius: 4,
      width: interpolate(v, [5, MAX_VELOCITY], [3, 7], Extrapolate.CLAMP),
      height: interpolate(v, [5, MAX_VELOCITY], [3, 7], Extrapolate.CLAMP),
    };
  });

  return <Animated.View style={[styles.spark, sparkStyle]} />;
};

// ─── Classic 3-Wing Spinner ──────────────────────────────────
const ClassicSpinner = ({
  colors,
  isDark,
}: {
  colors: any;
  isDark: boolean;
}) => (
  <>
    {[0, 120, 240].map((angle, i) => {
      const wingColors = [colors.primary, colors.success, colors.info];
      const c = wingColors[i];
      return (
        <View
          key={angle}
          style={[styles.wingContainer, { transform: [{ rotate: `${angle}deg` }], height: SPINNER_SIZE }]}
        >
          <LinearGradient
            colors={[c + '60', c + '20']}
            style={styles.rod3D}
          />
          <View style={[styles.classicWing, {
            borderColor: c,
            backgroundColor: isDark ? c + '22' : c + '15',
            shadowColor: c,
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: 4,
          }]}>
            <View style={[styles.classicWingInner, { backgroundColor: c + '50' }]} />
            <View style={[styles.classicWingCore, { backgroundColor: c }]} />
          </View>
        </View>
      );
    })}
  </>
);

// ─── Galaxy 4-Arm Spinner ─────────────────────────────────────
const GalaxySpinner = ({
  colors,
  isDark,
  rotation,
}: {
  colors: any;
  isDark: boolean;
  rotation: Animated.SharedValue<number>;
}) => {
  const innerRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rotation.value * 1.5}deg` }],
  }));

  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 0.5}deg` }],
  }));

  return (
    <>
      {/* Outer decorative ring */}
      <Animated.View style={[styles.galaxyOuterRing, { borderColor: colors.primary + '30' }, outerRingStyle]}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <View key={a} style={[styles.galaxyRingDot, {
            transform: [{ rotate: `${a}deg` }, { translateY: -(SPINNER_SIZE / 2 - 8) }],
            backgroundColor: a % 90 === 0 ? colors.primary : colors.primary + '40',
          }]} />
        ))}
      </Animated.View>

      {/* 4-arm galaxy spiral */}
      {[0, 90, 180, 270].map((angle, i) => (
        <View
          key={angle}
          style={[styles.wingContainer, { transform: [{ rotate: `${angle}deg` }], height: SPINNER_SIZE }]}
        >
          <LinearGradient
            colors={[colors.primary + '00', colors.primary + '80', colors.primary + '00']}
            style={[styles.galaxyArm]}
          />
        </View>
      ))}

      {/* Inner counter-rotating ring */}
      <Animated.View style={[styles.galaxyInnerRing, { borderColor: colors.info + '60' }, innerRingStyle]} />
    </>
  );
};

// ─── Star / Nova Spinner ──────────────────────────────────────
const StarSpinner = ({
  colors,
  isDark,
}: {
  colors: any;
  isDark: boolean;
}) => (
  <>
    {/* 5 spikes */}
    {[0, 72, 144, 216, 288].map((angle, i) => (
      <View
        key={angle}
        style={[styles.wingContainer, { transform: [{ rotate: `${angle}deg` }], height: SPINNER_SIZE }]}
      >
        <LinearGradient
          colors={['#FF6B6B', '#FFD93D', '#6BCB77']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.starSpike}
        />
        <View style={[styles.starGem, {
          backgroundColor: isDark ? '#FF6B6B22' : '#FF6B6B15',
          borderColor: '#FF6B6B',
          shadowColor: '#FF6B6B',
          shadowOpacity: 0.7,
          shadowRadius: 10,
          elevation: 6,
        }]}>
          <View style={[styles.starGemCore, { backgroundColor: '#FFD93D' }]} />
        </View>
      </View>
    ))}

    {/* Extra inner 5-spike offset */}
    {[36, 108, 180, 252, 324].map((angle) => (
      <View
        key={`inner-${angle}`}
        style={[styles.wingContainer, { transform: [{ rotate: `${angle}deg` }], height: SPINNER_SIZE * 0.6 }]}
      >
        <View style={[styles.starInnerSpike, { backgroundColor: '#6BCB77' + '60' }]} />
      </View>
    ))}
  </>
);

// ─── Main Component ───────────────────────────────────────────
export const FidgetSpinner = () => {
  const { colors, typography: t, isDark } = useTheme();
  const [spinnerType, setSpinnerType] = useState<SpinnerType>('classic');
  const [rpm, setRpm] = useState(0);

  const rotation = useSharedValue(0);
  const velocity = useSharedValue(0);
  const isHolding = useSharedValue(false);
  const scale = useSharedValue(1);

  const FRICTION = 0.992;
  const ACCELERATION = spinnerType === 'galaxy' ? 3.2 : spinnerType === 'star' ? 2.8 : 2.5;

  const updateRpm = useCallback((v: number) => {
    // Rough RPM estimate: velocity * 60fps / 360 degrees
    setRpm(Math.round((v * 60) / 360 * 60));
  }, []);

  // Physics loop
  useEffect(() => {
    let frameId: number;
    let lastVelocity = 0;
    const loop = () => {
      if (isHolding.value) {
        velocity.value = Math.min(velocity.value + ACCELERATION, MAX_VELOCITY);
      } else {
        velocity.value *= FRICTION;
        if (Math.abs(velocity.value) < 0.05) velocity.value = 0;
      }
      rotation.value += velocity.value;
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [spinnerType]);

  // Update RPM display at a reasonable rate
  useAnimatedReaction(
    () => Math.round(velocity.value * 10),
    (v) => {
      runOnJS(updateRpm)(velocity.value);
    }
  );

  const gesture = Gesture.Tap()
    .onBegin(() => {
      isHolding.value = true;
      scale.value = withSpring(0.93, { damping: 12 });
    })
    .onFinalize(() => {
      isHolding.value = false;
      scale.value = withSpring(1, { damping: 10 });
    });

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(velocity.value, [0, MAX_VELOCITY], [0, 0.6], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(velocity.value, [0, MAX_VELOCITY], [0.8, 1.3], Extrapolate.CLAMP) }],
  }));

  const meterWidth = useAnimatedStyle(() => ({
    width: `${(velocity.value / MAX_VELOCITY) * 100}%`,
    backgroundColor: velocity.value > 80 ? '#FF6B6B' : velocity.value > 40 ? '#FFD93D' : colors.primary,
  }));

  const glowColor = spinnerType === 'galaxy' ? colors.info : spinnerType === 'star' ? '#FFD93D' : colors.primary;
  const arms = spinnerType === 'galaxy' ? 4 : spinnerType === 'star' ? 5 : 3;

  const handleTypeChange = (type: SpinnerType) => {
    velocity.value = 0;
    setSpinnerType(type);
  };

  return (
    <GestureHandlerRootView>
      <GlassCard style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[t.titleSmall, { color: colors.text }]}>Focus Spinner</Text>
            <Text style={[t.caption, { color: colors.textTertiary }]}>Hold center to spin</Text>
          </View>
          <View style={[styles.rpmBadge, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[t.labelSmall, { color: colors.primary, fontVariant: ['tabular-nums'] }]}>
              {rpm}
            </Text>
            <Text style={[t.caption, { color: colors.textTertiary }]}> RPM</Text>
          </View>
        </View>

        {/* Spinner Type Picker */}
        <View style={[styles.typePicker, { backgroundColor: colors.backgroundSecondary, borderRadius: 16 }]}>
          {SPINNER_OPTIONS.map((opt) => {
            const isActive = spinnerType === opt.type;
            return (
              <Pressable
                key={opt.type}
                onPress={() => handleTypeChange(opt.type)}
                style={[
                  styles.typeBtn,
                  isActive && { backgroundColor: colors.primary, borderRadius: 12 },
                ]}
              >
                <Text style={{ fontSize: 14 }}>{opt.emoji}</Text>
                <Text style={[t.caption, {
                  color: isActive ? '#FFF' : colors.textSecondary,
                  marginTop: 2,
                  fontWeight: isActive ? '700' : '400',
                }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Spinner Area */}
        <View style={styles.gameArea}>
          {/* Glow halo behind spinner */}
          <Animated.View style={[styles.glowHalo, { backgroundColor: glowColor }, glowStyle]} />

          {/* Particles */}
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <SparkParticle
              key={i}
              index={i}
              rotation={rotation}
              velocity={velocity}
              primaryColor={colors.primary}
              accentColor={glowColor}
              arms={arms}
            />
          ))}

          {/* The spinner itself */}
          <View style={styles.spinnerWrapper}>
            <Animated.View style={[styles.spinnerBody, spinnerStyle]}>
              {spinnerType === 'classic' && <ClassicSpinner colors={colors} isDark={isDark} />}
              {spinnerType === 'galaxy' && <GalaxySpinner colors={colors} isDark={isDark} rotation={rotation} />}
              {spinnerType === 'star' && <StarSpinner colors={colors} isDark={isDark} />}

              {/* Center bearing — always on top */}
              <View style={[styles.centerBearing, {
                backgroundColor: isDark ? colors.backgroundSecondary : '#FFF',
                borderColor: glowColor,
                shadowColor: glowColor,
              }]}>
                <View style={[styles.centerCore, { backgroundColor: glowColor }]} />
              </View>
            </Animated.View>

            {/* Touch zone */}
            <GestureDetector gesture={gesture}>
              <View style={styles.touchZone} />
            </GestureDetector>
          </View>
        </View>

        {/* Speed Meter */}
        <View style={styles.meterSection}>
          <Text style={[t.caption, { color: colors.textTertiary, marginBottom: 6 }]}>Speed</Text>
          <View style={[styles.meterTrack, { backgroundColor: colors.backgroundSecondary }]}>
            <Animated.View style={[styles.meterFill, meterWidth]} />
            {/* Tick marks */}
            {[25, 50, 75].map((pct) => (
              <View
                key={pct}
                style={[styles.meterTick, {
                  left: `${pct}%` as any,
                  backgroundColor: isDark ? colors.background : colors.backgroundTertiary,
                }]}
              />
            ))}
          </View>
          <View style={styles.meterLabels}>
            <Text style={[t.caption, { color: colors.textTertiary }]}>Slow</Text>
            <Text style={[t.caption, { color: colors.textTertiary }]}>Fast</Text>
          </View>
        </View>
      </GlassCard>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  rpmBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  typePicker: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 2,
  },
  gameArea: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  glowHalo: {
    position: 'absolute',
    width: SPINNER_SIZE * 1.1,
    height: SPINNER_SIZE * 1.1,
    borderRadius: SPINNER_SIZE * 0.55,
    opacity: 0,
  },
  spinnerWrapper: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerBody: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchZone: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    zIndex: 30,
  },
  centerBearing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  centerCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  spark: {
    position: 'absolute',
    zIndex: 5,
  },

  // ─── Classic Spinner Parts ────────────────────────
  wingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rod3D: {
    width: 10,
    height: SPINNER_SIZE / 2 - 28,
    borderRadius: 5,
    marginTop: 8,
  },
  classicWing: {
    position: 'absolute',
    top: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  classicWingInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classicWingCore: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // ─── Galaxy Spinner Parts ─────────────────────────
  galaxyOuterRing: {
    position: 'absolute',
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    borderRadius: SPINNER_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galaxyRingDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  galaxyArm: {
    width: 8,
    height: SPINNER_SIZE / 2 - 26,
    borderRadius: 4,
    marginTop: 24,
    opacity: 0.85,
  },
  galaxyInnerRing: {
    position: 'absolute',
    width: SPINNER_SIZE * 0.45,
    height: SPINNER_SIZE * 0.45,
    borderRadius: (SPINNER_SIZE * 0.45) / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },

  // ─── Star / Nova Spinner Parts ────────────────────
  starSpike: {
    width: 7,
    height: SPINNER_SIZE / 2 - 26,
    borderRadius: 3.5,
    marginTop: 10,
    opacity: 0.9,
  },
  starGem: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  starGemCore: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  starInnerSpike: {
    width: 5,
    height: (SPINNER_SIZE * 0.6) / 2 - 14,
    borderRadius: 2.5,
    marginTop: 8,
  },

  // ─── Meter ────────────────────────────────────────
  meterSection: {
    marginTop: 4,
  },
  meterTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  meterTick: {
    position: 'absolute',
    top: 0,
    width: 1.5,
    height: '100%',
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});
