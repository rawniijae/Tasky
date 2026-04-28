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

  if (!riddle) return null;

  return (
    <Animated.View entering={FadeIn.delay(300)} layout={Layout.springify()}>
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.info}20` }]}>
            <Ionicons name="help-circle" size={18} color={colors.info} />
          </View>
          <Text style={[t.labelMedium, { color: colors.textSecondary }]}>Daily Riddle</Text>
        </View>

        <Text style={[t.bodyMedium, { color: colors.text, marginTop: 12 }]}>
          {riddle.question}
        </Text>

        {showAnswer ? (
          <Animated.View entering={FadeIn} style={styles.answerBox}>
            <Text style={[t.labelSmall, { color: colors.textTertiary }]}>ANSWER:</Text>
            <Text style={[t.titleSmall, { color: colors.success, marginTop: 2 }]}>
              {riddle.answer}
            </Text>
          </Animated.View>
        ) : (
          <Pressable
            onPress={() => setShowAnswer(true)}
            style={({ pressed }) => [
              styles.revealBtn,
              { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[t.labelSmall, { color: colors.info }]}>Tap to reveal answer</Text>
          </Pressable>
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
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  revealBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
