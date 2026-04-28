import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, Layout, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useContentStore } from '@/src/stores/contentStore';
import { GlassCard } from '../ui/GlassCard';

export function DailyRiddle() {
  const { colors, typography: t, spacing: sp } = useTheme();
  const getDailyRiddle = useContentStore((s) => s.getDailyRiddle);
  const riddle = getDailyRiddle();
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    if (!riddle || showAnswer) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowAnswer(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [riddle, showAnswer]);

  if (!riddle) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View entering={FadeIn.delay(300)} layout={Layout.springify()}>
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.info}20` }]}>
            <Ionicons name="help-circle" size={18} color={colors.info} />
          </View>
          <Text style={[t.labelMedium, { color: colors.textSecondary }]}>Daily Riddle</Text>
          <View style={[styles.timerBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="timer-outline" size={12} color={colors.textTertiary} />
            <Text style={[t.caption, { color: colors.textTertiary, marginLeft: 4, fontSize: 10 }]}>
              {showAnswer ? 'Revealed' : formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <Text style={[t.bodyMedium, { color: colors.text, marginTop: 12 }]}>
          {riddle.question}
        </Text>

        {showHint && !showAnswer && (
          <Animated.View entering={FadeIn} style={[styles.hintBox, { backgroundColor: `${colors.warning}10` }]}>
            <Text style={[t.caption, { color: colors.warning, fontStyle: 'italic' }]}>
              HINT: {riddle.hint}
            </Text>
          </Animated.View>
        )}

        {showAnswer ? (
          <Animated.View entering={FadeIn} style={styles.answerBox}>
            <Text style={[t.labelSmall, { color: colors.textTertiary }]}>ANSWER:</Text>
            <Text style={[t.titleSmall, { color: colors.success, marginTop: 2 }]}>
              {riddle.answer}
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.actionRow}>
            {!showHint && (
              <Pressable
                onPress={() => setShowHint(true)}
                style={[styles.smallBtn, { borderColor: colors.warning }]}
              >
                <Text style={[t.labelSmall, { color: colors.warning }]}>Need a hint?</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => setShowAnswer(true)}
              style={({ pressed }) => [
                styles.revealBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={[t.labelSmall, { color: '#FFF' }]}>Reveal Answer Now</Text>
            </Pressable>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EAB308',
  },
  answerBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  revealBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
