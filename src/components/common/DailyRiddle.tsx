import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { riddles } from '@/src/utils/riddles';
import { useHaptics } from '@/src/hooks/useHaptics';

export function DailyRiddle() {
  const { colors, typography: t, spacing: sp, borderRadius: br, isDark } = useTheme();
  const haptics = useHaptics();
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [canSeeAnswer, setCanSeeAnswer] = useState(false);

  // Pick a riddle based on the day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const riddle = riddles[dayOfYear % riddles.length];

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanSeeAnswer(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const checkAnswer = () => {
    const normalize = (text: string) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/^(a|an|the)\s+/i, '')
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Remove punctuation
        .trim();
    };

    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(riddle.answer);
    
    if (normalizedUser === normalizedCorrect && normalizedUser !== '') {
      haptics.success();
      setIsCorrect(true);
      setShowAnswer(true);
      setCanSeeAnswer(true);
    } else {
      haptics.error();
      setIsCorrect(false);
    }
  };


  return (
    <Animated.View
      entering={FadeIn.delay(300).duration(600)}
      style={[
        styles.container,
        {
          backgroundColor: colors.glassBg,
          borderColor: colors.glassBorder,
          borderRadius: br.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="help-circle" size={20} color={colors.primary} />
          <Text style={[t.titleSmall, { color: colors.text, marginLeft: 8 }]}>Daily Riddle</Text>
        </View>
        {!canSeeAnswer && (
          <View style={[styles.timerBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Text style={[t.labelSmall, { color: colors.textTertiary }]}>{formatTime(timeLeft)}</Text>
          </View>
        )}
      </View>

      <Text style={[t.bodyMedium, { color: colors.text, marginTop: 12, lineHeight: 22 }]}>
        {riddle.question}
      </Text>

      {/* Answer Input */}
      <View style={styles.inputSection}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.backgroundSecondary,
              color: colors.text,
              borderColor: isCorrect === true ? colors.success : isCorrect === false ? colors.danger : colors.border,
            }
          ]}
          placeholder="Type your answer..."
          placeholderTextColor={colors.textTertiary}
          value={userAnswer}
          onChangeText={(text) => {
            setUserAnswer(text);
            if (isCorrect !== null) setIsCorrect(null);
          }}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity 
          onPress={checkAnswer}
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      {isCorrect === false && (
        <Text style={[t.caption, { color: colors.danger, marginTop: 4, marginLeft: 4 }]}>
          Not quite! Try again.
        </Text>
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={() => setShowHint(!showHint)}
          style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
        >
          <Text style={[t.labelMedium, { color: colors.primary }]}>
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => canSeeAnswer && setShowAnswer(!showAnswer)}
          disabled={!canSeeAnswer}
          style={[
            styles.actionButton, 
            { 
              backgroundColor: canSeeAnswer ? colors.primary : colors.backgroundTertiary,
              opacity: canSeeAnswer ? 1 : 0.5 
            }
          ]}
        >
          <Text style={[t.labelMedium, { color: canSeeAnswer ? colors.textInverse : colors.textTertiary }]}>
            {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
          </Text>
        </TouchableOpacity>
      </View>

      {showHint && (
        <Animated.View entering={SlideInRight} style={styles.hintContainer}>
          <Text style={[t.caption, { color: colors.textSecondary, fontStyle: 'italic' }]}>
            💡 Hint: {riddle.hint}
          </Text>
        </Animated.View>
      )}

      {showAnswer && canSeeAnswer && (
        <Animated.View entering={FadeIn} style={[styles.answerContainer, { backgroundColor: isDark ? 'rgba(16,163,127,0.1)' : 'rgba(16,163,127,0.05)' }]}>
          <Text style={[t.bodyMedium, { color: colors.success, fontWeight: '700' }]}>
            Answer: {riddle.answer}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  inputSection: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  submitBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  hintContainer: {
    marginTop: 12,
    padding: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#F59E0B',
  },
  answerContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
