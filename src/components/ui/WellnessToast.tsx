import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useContentStore } from '@/src/stores/contentStore';
import { GlassCard } from './GlassCard';

interface WellnessToastProps {
  visible: boolean;
  onHide: () => void;
}

export function WellnessToast({ visible, onHide }: WellnessToastProps) {
  const { colors, typography: t, borderRadius: br } = useTheme();
  const getRandomWellnessTask = useContentStore((s) => s.getRandomWellnessTask);
  const task = getRandomWellnessTask();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={[styles.container, { top: 60 }]}
    >
      <GlassCard style={[styles.card, { borderColor: colors.success }]}>
        <View style={[styles.iconBox, { backgroundColor: `${colors.success}20` }]}>
          <Ionicons name="sparkles" size={20} color={colors.success} />
        </View>
        <View style={styles.content}>
          <Text style={[t.labelSmall, { color: colors.success }]}>WELL DONE! RELAX A BIT:</Text>
          <Text style={[t.bodyMedium, { color: colors.text, marginTop: 2 }]}>
            {task}
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
});
