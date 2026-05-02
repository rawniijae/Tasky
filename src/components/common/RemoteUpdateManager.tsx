import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Linking, Platform } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useHaptics } from '@/src/hooks/useHaptics';

const CONFIG_URL = 'https://raw.githubusercontent.com/rawniijae/Tasky/main/app_config.json';

interface RemoteConfig {
  latestVersion: string;
  forceUpdate: boolean;
  apkUrl: string;
  updateMessage: {
    id: string;
    title: string;
    body: string;
    type: 'info' | 'critical' | 'welcome';
  } | null;
}

export function RemoteUpdateManager() {
  const { colors, typography: t, isDark, borderRadius: br } = useTheme();
  const haptics = useHaptics();
  const lastSeenUpdateId = useSettingsStore((s) => s.lastSeenUpdateId);
  const setLastSeenUpdateId = useSettingsStore((s) => s.setLastSeenUpdateId);
  const currentVersion = useSettingsStore((s) => s.currentVersion);

  const [config, setConfig] = useState<RemoteConfig | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const res = await fetch(CONFIG_URL);
        if (!res.ok) return; // Silent skip if file missing
        
        const data: RemoteConfig = await res.json();


        // Logic 1: Force Update (Emergency)
        const isNewerVersion = data.latestVersion !== currentVersion;
        if (data.forceUpdate && isNewerVersion) {
          setConfig(data);
          setVisible(true);
          return;
        }

        // Logic 2: New Announcement
        if (data.updateMessage && data.updateMessage.id !== lastSeenUpdateId) {
          setConfig(data);
          setVisible(true);
        }
      } catch (err) {
        console.log('Update check failed:', err);
      }
    };

    checkUpdates();
  }, [currentVersion, lastSeenUpdateId]);

  const handleClose = () => {
    if (config?.forceUpdate) return; // Cannot close emergency update
    
    if (config?.updateMessage) {
      setLastSeenUpdateId(config.updateMessage.id);
    }
    setVisible(false);
    haptics.light();
  };

  const handleUpdate = () => {
    haptics.medium();
    if (config?.apkUrl) {
      Linking.openURL(config.apkUrl);
    }
  };

  if (!config) return null;

  const isEmergency = config.forceUpdate && config.latestVersion !== currentVersion;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
        
        <Animated.View 
          entering={FadeInDown.duration(500).springify()}
          style={[styles.content, { backgroundColor: colors.surface, borderRadius: br['2xl'] }]}
        >
          <View style={[styles.iconContainer, { backgroundColor: isEmergency ? `${colors.error}15` : `${colors.primary}15` }]}>
            <Ionicons 
              name={isEmergency ? "alert-circle" : "notifications"} 
              size={32} 
              color={isEmergency ? colors.error : colors.primary} 
            />
          </View>

          <Text style={[t.headlineSmall, { color: colors.text, textAlign: 'center', marginTop: 16 }]}>
            {isEmergency ? "Emergency Update" : (config.updateMessage?.title || "Update Available")}
          </Text>

          <Text style={[t.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 }]}>
            {isEmergency 
              ? `You are using an outdated version (${currentVersion}). Please update to v${config.latestVersion} to continue using Tasky.`
              : (config.updateMessage?.body || "A new version of Tasky is available with improvements.")
            }
          </Text>

          <View style={styles.footer}>
            {!isEmergency && (
              <Pressable 
                onPress={handleClose}
                style={[styles.button, { backgroundColor: colors.backgroundSecondary, flex: 1 }]}
              >
                <Text style={[t.labelMedium, { color: colors.textSecondary }]}>Dismiss</Text>
              </Pressable>
            )}
            
            {(isEmergency || config.apkUrl) && (
              <Pressable 
                onPress={handleUpdate}
                style={[styles.button, { backgroundColor: isEmergency ? colors.error : colors.primary, flex: 2 }]}
              >
                <Text style={[t.labelLarge, { color: '#FFF' }]}>
                  {isEmergency ? "Update Now" : "Download"}
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 28,
  },
  button: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
