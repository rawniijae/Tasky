import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useSettingsStore } from '@/src/stores/settingsStore';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

export const MandatoryUpdateOverlay = () => {
  const { colors, typography: t, isDark } = useTheme();
  const updateInfo = useSettingsStore((s) => s.updateInfo);
  const currentVersion = useSettingsStore((s) => s.currentVersion);

  // Conditions for blocking:
  // 1. We have update info
  // 2. Latest version is greater than current
  // 3. It is marked as MANDATORY
  const isMandatory = updateInfo?.isMandatory;
  const hasNewerVersion = updateInfo && isVersionGreater(updateInfo.latestVersion, currentVersion);
  const shouldBlock = isMandatory && hasNewerVersion;

  if (!shouldBlock) return null;

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.container}>
        <BlurView intensity={isDark ? 50 : 80} style={StyleSheet.absoluteFill} />
        
        <Animated.View 
          entering={ZoomIn.duration(400)} 
          style={[styles.card, { backgroundColor: isDark ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.8)' }]}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="rocket-outline" size={48} color={colors.primary} />
          </View>

          <Text style={[t.headlineSmall, { color: colors.text, textAlign: 'center', marginTop: 24 }]}>
            Update Required
          </Text>
          
          <Text style={[t.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 }]}>
            To keep Tasky running smoothly and securely, you need to update to the latest version (v{updateInfo?.latestVersion}).
          </Text>

          {updateInfo?.releaseNotes && (
            <View style={styles.notesBox}>
              <Text style={[t.labelSmall, { color: colors.textTertiary, marginBottom: 4 }]}>WHAT'S NEW</Text>
              <Text style={[t.caption, { color: colors.textSecondary }]}>{updateInfo.releaseNotes}</Text>
            </View>
          )}

          <Pressable
            onPress={() => Linking.openURL(updateInfo!.updateUrl)}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
            ]}
          >
            <Ionicons name="download-outline" size={20} color="#FFF" style={{ marginRight: 10 }} />
            <Text style={[t.labelMedium, { color: '#FFF' }]}>Update Now</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 24,
  }
});
