import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useContentStore } from '@/src/stores/contentStore';

export function MotivationalQuote() {

  const { colors, typography: t, spacing: sp, borderRadius: br } = useTheme();
  const quotes = useContentStore((s) => s.quotes);
  const fetchContent = useContentStore((s) => s.fetchContent);
  
  // Calculate index reactively based on date and quotes length
  const dayCounter = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const quote = quotes.length > 0 ? quotes[dayCounter % quotes.length] : null;

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
