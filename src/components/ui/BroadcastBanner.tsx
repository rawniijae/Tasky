import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useSettingsStore } from '@/src/stores/settingsStore';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export const BroadcastBanner = () => {
  const { colors, typography: t, isDark } = useTheme();
  const broadcast = useSettingsStore((s) => s.broadcastMessage);
  const dismissedId = useSettingsStore((s) => (s as any).dismissedBroadcastId);
  const dismissBroadcast = useSettingsStore((s) => (s as any).dismissBroadcast);

  // Don't show if no message or already dismissed
  const shouldShow = broadcast && dismissedId !== broadcast.id;

  if (!shouldShow) return null;

  const getGradient = () => {
    switch (broadcast?.type) {
      case 'personal': return [colors.primary, colors.primary + 'CC'];
      case 'announcement': return [colors.warning, colors.warning + 'CC'];
      default: return [colors.info, colors.info + 'CC'];
    }
  };

  const getIcon = () => {
    switch (broadcast?.type) {
      case 'personal': return 'heart-outline';
      case 'announcement': return 'megaphone-outline';
      default: return 'chatbubble-outline';
    }
  };

  return (
    <Animated.View 
      entering={FadeInUp.delay(500)} 
      exiting={FadeOutUp}
      style={styles.container}
    >
      <Pressable onPress={() => dismissBroadcast(broadcast!.id)}>
        <LinearGradient
          colors={getGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Ionicons name={getIcon()} size={20} color="#FFF" />
            
            <Text style={[t.labelSmall, { color: '#FFF', flex: 1, marginLeft: 12, lineHeight: 18 }]}>
              {broadcast?.text}
            </Text>

            <View style={styles.closeButton}>
              <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  }
});
