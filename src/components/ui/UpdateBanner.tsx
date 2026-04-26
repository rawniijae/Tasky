import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useSettingsStore } from '@/src/stores/settingsStore';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { router } from 'expo-router';

export const UpdateBanner = () => {
  const { colors, typography: t, isDark } = useTheme();
  const updateInfo = useSettingsStore((s) => s.updateInfo);
  const dismissedVersion = useSettingsStore((s) => (s as any).dismissedVersion);
  const currentVersion = useSettingsStore((s) => s.currentVersion);
  const dismissUpdate = useSettingsStore((s) => (s as any).dismissUpdate);

  // Conditions for showing:
  // 1. We have update info
  // 2. Latest version is greater than current
  // 3. User hasn't dismissed this specific version OR it's mandatory
  const hasNewerVersion = updateInfo && isVersionGreater(updateInfo.latestVersion, currentVersion);
  const isDismissed = dismissedVersion === updateInfo?.latestVersion;
  const shouldShow = hasNewerVersion && (!isDismissed || updateInfo?.isMandatory);

  if (!shouldShow) return null;

  return (
    <Animated.View 
      entering={FadeInUp} 
      exiting={FadeOutUp}
      style={styles.container}
    >
      <BlurView intensity={isDark ? 40 : 60} style={styles.blur}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[t.titleSmall, { color: colors.text }]}>
              {updateInfo?.isMandatory ? 'Critical Update' : 'Update Available'} (v{updateInfo?.latestVersion})
            </Text>
            <Text style={[t.caption, { color: colors.textSecondary }]} numberOfLines={1}>
              {updateInfo?.releaseNotes || 'New features are ready for you!'}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push('/profile' as any)}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Text style={[t.labelSmall, { color: '#FFF' }]}>View</Text>
            </Pressable>

            {!updateInfo?.isMandatory && (
              <Pressable
                onPress={() => dismissUpdate(updateInfo!.latestVersion)}
                style={styles.dismissButton}
              >
                <Ionicons name="close" size={20} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

function isVersionGreater(latest: string, current: string): boolean {
  const v1 = latest.split('.').map(Number);
  const v2 = current.split('.').map(Number);
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const n1 = v1[i] || 0;
    const n2 = v2[i] || 0;
    if (n1 > n2) return true;
    if (n1 < n2) return false;
  }
  return false;
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blur: {
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dismissButton: {
    padding: 4,
  }
});
