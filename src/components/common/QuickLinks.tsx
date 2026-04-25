import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';

interface QuickLink {
  id: string;
  name: string;
  icon: string;
  color: string;
  deepLink: string;
  webUrl: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🤖',
    color: '#10A37F',
    deepLink: 'chatgpt://',
    webUrl: 'https://chat.openai.com',
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '🧠',
    color: '#D97757',
    deepLink: 'claude://',
    webUrl: 'https://claude.ai',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🎵',
    color: '#1DB954',
    deepLink: 'spotify://',
    webUrl: 'https://open.spotify.com',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    deepLink: 'youtube://',
    webUrl: 'https://www.youtube.com',
  },
];

export function QuickLinks() {
  const { colors, isDark, typography: t } = useTheme();

  const handlePress = async (link: QuickLink) => {
    try {
      // Try to open the native app first
      const canOpen = await Linking.canOpenURL(link.deepLink);
      if (canOpen) {
        await Linking.openURL(link.deepLink);
      } else {
        // Fall back to web URL
        await Linking.openURL(link.webUrl);
      }
    } catch {
      // If deep link fails, open web URL
      try {
        await Linking.openURL(link.webUrl);
      } catch (e) {
        console.log('Failed to open link:', e);
      }
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(400)}
      style={styles.container}
    >
      <Text style={[t.titleSmall, { color: colors.text, marginBottom: 12, marginHorizontal: 20 }]}>
        Quick Links
      </Text>
      <View style={styles.grid}>
        {QUICK_LINKS.map((link, index) => (
          <Animated.View
            key={link.id}
            entering={FadeInDown.delay(300 + index * 80).duration(400).springify()}
            style={styles.linkWrapper}
          >
            <TouchableOpacity
              onPress={() => handlePress(link)}
              activeOpacity={0.7}
              style={[
                styles.linkCard,
                {
                  backgroundColor: isDark
                    ? `${link.color}18`
                    : `${link.color}12`,
                  borderColor: isDark
                    ? `${link.color}30`
                    : `${link.color}25`,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isDark
                      ? `${link.color}25`
                      : `${link.color}18`,
                  },
                ]}
              >
                <Text style={styles.icon}>{link.icon}</Text>
              </View>
              <Text
                style={[
                  styles.linkName,
                  {
                    color: isDark ? '#E2E8F0' : '#334155',
                  },
                ]}
                numberOfLines={1}
              >
                {link.name}
              </Text>
              <View
                style={[
                  styles.arrowBadge,
                  {
                    backgroundColor: isDark
                      ? `${link.color}30`
                      : `${link.color}20`,
                  },
                ]}
              >
                <Text style={[styles.arrow, { color: link.color }]}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  linkWrapper: {
    width: '47%',
    flexGrow: 1,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  linkName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  arrowBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 14,
    fontWeight: '700',
  },
});
