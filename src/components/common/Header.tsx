import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { WeatherWidget } from './WeatherWidget';
import { useSettingsStore } from '@/src/stores/settingsStore';

interface HeaderProps {
  greeting?: string;
  subtitle?: string;
  showWeather?: boolean;
}

export function Header({ greeting, subtitle, showWeather = false }: HeaderProps) {
  const { colors, typography: t, spacing: sp } = useTheme();
  const themeFlavor = useSettingsStore((s) => s.settings.themeFlavor);

  const getGreeting = () => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 8 }}>
          <Text
            style={[t.headlineLarge, { color: colors.text, flexShrink: 1 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {getGreeting()}
          </Text>
          {themeFlavor === 'hello_kitty' && (
            <Image 
              source={require('../../../assets/themes/hello_kitty.png')} 
              style={{ width: 32, height: 32, borderRadius: 16, marginLeft: 8 }} 
            />
          )}
        </View>
        {showWeather && (
          <View style={{ flexShrink: 0 }}>
            <WeatherWidget />
          </View>
        )}
      </View>
      {subtitle && (
        <Text
          style={[
            t.bodyMedium,
            { color: colors.textSecondary, marginTop: 4 },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});
