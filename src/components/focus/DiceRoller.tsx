import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withRepeat,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassCard } from '../ui/GlassCard';

// ─── Dice Challenges ─────────────────────────────────────────
const DICE_CHALLENGES: Record<number, { emoji: string; title: string; description: string; color: string }> = {
  1: {
    emoji: '💪',
    title: 'Power Up!',
    description: 'Do 10 push-ups right now. Your body will thank you!',
    color: '#EF4444',
  },
  2: {
    emoji: '💧',
    title: 'Hydrate!',
    description: 'Drink a full glass of water. Stay hydrated for peak focus!',
    color: '#3B82F6',
  },
  3: {
    emoji: '🍎',
    title: 'Fuel Up!',
    description: 'Eat a piece of fruit. Natural energy for your brain!',
    color: '#22C55E',
  },
  4: {
    emoji: '🚶',
    title: 'Walk Break!',
    description: 'Take a 5-minute walk. Moving your body boosts creativity!',
    color: '#F59E0B',
  },
  5: {
    emoji: '🧘',
    title: 'Breathe!',
    description: 'Take 10 deep breaths. Reset your mind and reduce stress!',
    color: '#8B5CF6',
  },
  6: {
    emoji: '🤸',
    title: 'Stretch!',
    description: 'Stretch your neck, arms and back for 60 seconds. Release the tension!',
    color: '#EC4899',
  },
};

// ─── Dice Face SVG ────────────────────────────────────────────
const DOT_POSITIONS: Record<number, { cx: number; cy: number }[]> = {
  1: [{ cx: 50, cy: 50 }],
  2: [{ cx: 25, cy: 25 }, { cx: 75, cy: 75 }],
  3: [{ cx: 25, cy: 25 }, { cx: 50, cy: 50 }, { cx: 75, cy: 75 }],
  4: [{ cx: 25, cy: 25 }, { cx: 75, cy: 25 }, { cx: 25, cy: 75 }, { cx: 75, cy: 75 }],
  5: [{ cx: 25, cy: 25 }, { cx: 75, cy: 25 }, { cx: 50, cy: 50 }, { cx: 25, cy: 75 }, { cx: 75, cy: 75 }],
  6: [
    { cx: 25, cy: 20 }, { cx: 75, cy: 20 },
    { cx: 25, cy: 50 }, { cx: 75, cy: 50 },
    { cx: 25, cy: 80 }, { cx: 75, cy: 80 },
  ],
};

function DiceFace({ value, size = 100, color }: { value: number; size?: number; color: string }) {
  const dots = DOT_POSITIONS[value] || [];
  const r = size / 13;
  const scale = size / 100;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.18,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: color,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
      }}
    >
      {dots.map((d, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: r * 2 * scale,
            height: r * 2 * scale,
            borderRadius: r * scale,
            backgroundColor: color,
            left: (d.cx / 100) * size - r * scale,
            top: (d.cy / 100) * size - r * scale,
          }}
        />
      ))}
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────
interface DiceRollerProps {
  scrollViewRef?: React.RefObject<any>;
}

export const DiceRoller = ({ scrollViewRef }: DiceRollerProps) => {
  const { colors, typography: t, isDark } = useTheme();
  const [currentFace, setCurrentFace] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const containerRef = useRef<View>(null);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const bounceY = useSharedValue(0);

  const challenge = result ? DICE_CHALLENGES[result] : null;

  const scrollToSelf = useCallback(() => {
    // Measure this component's position and scroll to keep it visible
    if (scrollViewRef?.current && containerRef.current) {
      containerRef.current.measureLayout(
        scrollViewRef.current.getInnerViewRef?.() ?? scrollViewRef.current,
        (_x: number, y: number) => {
          // Scroll so the dice button area stays in view (offset up a bit so user sees dice + result)
          scrollViewRef.current?.scrollTo?.({ y: Math.max(0, y - 120), animated: true });
        },
        () => {} // onFail — do nothing
      );
    }
  }, [scrollViewRef]);

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setShowChallenge(false);

    // Scroll the dice section into comfortable view before rolling
    scrollToSelf();

    // Physics-like roll animation
    rotation.value = withSequence(
      withRepeat(
        withTiming(360, { duration: 120 }),
        8,
        false
      ),
      withSpring(0, { damping: 10 })
    );
    scale.value = withSequence(
      withSpring(1.15, { damping: 8 }),
      withTiming(0.9, { duration: 80 }),
      withSpring(1, { damping: 12 })
    );
    bounceY.value = withSequence(
      withTiming(-20, { duration: 200 }),
      withTiming(0, { duration: 120 }),
      withTiming(-8, { duration: 100 }),
      withTiming(0, { duration: 80 }),
    );

    // Cycle through random faces during roll — use a ref to avoid rapid state updates
    let ticks = 0;
    const interval = setInterval(() => {
      setCurrentFace(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks >= 20) {
        clearInterval(interval);
        const finalResult = Math.floor(Math.random() * 6) + 1;
        setCurrentFace(finalResult);
        setResult(finalResult);
        setIsRolling(false);
        setTimeout(() => {
          setShowChallenge(true);
          // After challenge card appears, scroll down slightly to show it fully
          setTimeout(() => scrollToSelf(), 100);
        }, 400);
      }
    }, 60);
  };

  const diceStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
      { translateY: bounceY.value },
    ],
  }));

  const challengeColor = challenge?.color ?? colors.primary;

  return (
    <GlassCard style={styles.container}>
      <View ref={containerRef} collapsable={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[t.titleSmall, { color: colors.text }]}>Wellness Dice</Text>
            <Text style={[t.caption, { color: colors.textTertiary }]}>Roll for a random wellness challenge</Text>
          </View>
          <Text style={{ fontSize: 22 }}>🎲</Text>
        </View>

        {/* Dice Display */}
        <View style={styles.diceArea}>
          <Animated.View style={diceStyle}>
            <DiceFace
              value={currentFace}
              size={110}
              color={result ? DICE_CHALLENGES[currentFace]?.color ?? colors.primary : colors.primary}
            />
          </Animated.View>

          {/* Roll button */}
          <Pressable
            onPress={handleRoll}
            disabled={isRolling}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, marginTop: 24 }]}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rollBtn}
            >
              <Ionicons
                name={isRolling ? 'refresh' : 'dice'}
                size={20}
                color="#FFF"
                style={isRolling ? { transform: [{ rotate: '45deg' }] } : {}}
              />
              <Text style={[t.labelMedium, { color: '#FFF', marginLeft: 8 }]}>
                {isRolling ? 'Rolling...' : 'Roll the Dice!'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Challenge Card — always mounted to prevent layout shift, just hidden via opacity/height */}
        <View style={{ overflow: 'hidden', minHeight: showChallenge && challenge ? undefined : 0 }}>
          {showChallenge && challenge && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={[
                styles.challengeCard,
                { backgroundColor: challengeColor + (isDark ? '22' : '15'), borderColor: challengeColor + '60' },
              ]}
            >
              <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>{challenge.emoji}</Text>
              <Text style={[t.titleSmall, { color: challengeColor, textAlign: 'center' }]}>
                {challenge.title}
              </Text>
              <Text style={[t.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20 }]}>
                {challenge.description}
              </Text>

              {/* Number badge */}
              <View style={[styles.rollBadge, { backgroundColor: challengeColor }]}>
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>Rolled {result}</Text>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {Object.entries(DICE_CHALLENGES).map(([num, ch]) => (
            <View key={num} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: ch.color }]} />
              <Text style={[t.caption, { color: colors.textTertiary }]}>
                {num}. {ch.emoji}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  diceArea: {
    alignItems: 'center',
    marginBottom: 16,
  },
  rollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 24,
  },
  challengeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  rollBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150,150,150,0.2)',
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '30%',
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
