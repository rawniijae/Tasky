import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import Animated, { FadeIn, Layout, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useContentStore } from '@/src/stores/contentStore';
import { GlassCard } from '../ui/GlassCard';

export function DailyRiddle() {
  const { colors, typography: t, spacing: sp } = useTheme();
  const riddles = useContentStore((s) => s.riddles);
  
  // Calculate index reactively based on date and riddles length
  const dayCounter = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const riddle = riddles.length > 0 ? riddles[dayCounter % riddles.length] : null;

  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleCheck = () => {
    if (!riddle) return;
    
    const normalize = (str: string) => 
      str.toLowerCase()
         .replace(/^(a|an|the)\s+/i, '')
         .trim();

    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(riddle.answer);

    // Check for exact match or if user answer is a significant part of correct answer
    if (normalizedUser === normalizedCorrect || 
        (normalizedUser.length >= 3 && normalizedCorrect.includes(normalizedUser))) {
      setShowAnswer(true);
      setIsCorrect(true);
      setError(false);
    } else {
      setError(true);
    }
  };

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
            <View style={styles.answerHeader}>
              <Ionicons 
                name={isCorrect ? "checkmark-circle" : "information-circle"} 
                size={16} 
                color={isCorrect ? colors.success : colors.info} 
              />
              <Text style={[t.labelSmall, { color: isCorrect ? colors.success : colors.info, marginLeft: 4 }]}>
                {isCorrect ? 'CORRECT!' : 'REVEALED'}
              </Text>
            </View>
            <Text style={[t.titleSmall, { color: colors.text, marginTop: 4 }]}>
              {riddle.answer}
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.actionSection}>
            <View style={[styles.inputRow, { borderBottomColor: error ? colors.danger : colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: 'Inter_500Medium' }]}
                placeholder={error ? "Try again..." : "Type your answer..."}
                placeholderTextColor={error ? colors.danger : colors.textTertiary}
                value={userAnswer}
                onChangeText={(text) => {
                  setUserAnswer(text);
                  setError(false);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable 
                onPress={handleCheck}
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </Pressable>
            </View>
            
            {error && (
              <Animated.View entering={FadeIn} style={{ marginTop: -8, marginBottom: 8 }}>
                <Text style={[t.caption, { color: colors.danger }]}>Wrong answer, keep thinking!</Text>
              </Animated.View>
            )}

            <View style={styles.actionRow}>
              {!showHint && (
                <Pressable
                  onPress={() => setShowHint(true)}
                  style={[styles.smallBtn, { borderColor: colors.warning }]}
                >
                  <Text style={[t.labelSmall, { color: colors.warning }]}>Need a hint?</Text>
                </Pressable>
              )}
              
              {timeLeft <= 60 && (
                <Pressable
                  onPress={() => setShowAnswer(true)}
                  style={({ pressed }) => [
                    styles.revealBtn,
                    { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={[t.labelSmall, { color: colors.danger }]}>Give Up</Text>
                </Pressable>
              )}

              {timeLeft > 60 && (
                <View style={[styles.revealBtn, { backgroundColor: colors.backgroundTertiary, opacity: 0.8 }]}>
                  <Text style={[t.labelSmall, { color: colors.textTertiary }]}>
                    Reveal available in {formatTime(timeLeft)}
                  </Text>
                </View>
              )}
            </View>
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
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionSection: {
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  submitBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
