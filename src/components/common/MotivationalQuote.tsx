import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useContentStore } from '@/src/stores/contentStore';

export function MotivationalQuote() {
  const { colors, typography: t, spacing: sp, borderRadius: br } = useTheme();
  const getDailyQuote = useContentStore((s) => s.getDailyQuote);
  const fetchContent = useContentStore((s) => s.fetchContent);
  const quote = getDailyQuote();

  React.useEffect(() => {
    fetchContent();
  }, []);

  if (!quote) return null;

  return (
    <Animated.View
      entering={FadeIn.delay(200).duration(600)}
      style={[
        styles.container,
        {
          backgroundColor: colors.glassBg,
          borderColor: colors.glassBorder,
          borderRadius: br.xl,
        },
      ]}
    >
      <Text style={[t.bodySmall, { color: colors.textSecondary, fontStyle: 'italic' }]}>
        "{quote.text}"
      </Text>
      <Text
        style={[
          t.caption,
          { color: colors.textTertiary, marginTop: 6, textAlign: 'right' },
        ]}
      >
        — {quote.author}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
  },
});
