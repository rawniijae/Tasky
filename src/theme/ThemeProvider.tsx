import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  ThemeColors,
  lightColors,
  darkColors,
  priorityColors,
  priorityColorsDark,
  PriorityColorSet,
} from './colors';
import { typography } from './typography';
import { spacing, borderRadius, iconSize } from './spacing';
import { shadows, shadowsDark } from './shadows';
import { getFlavorColors } from './themes';
import { useSettingsStore } from '@/src/stores/settingsStore';
import type { ThemeMode } from '@/src/types';

export interface Theme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  iconSize: typeof iconSize;
  shadows: typeof shadows;
  priorityColors: PriorityColorSet;
  isDark: boolean;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const { theme: themePreference, themeFlavor } = useSettingsStore((s) => s.settings);

  const isDark = useMemo(() => {
    if (themePreference === 'system') {
      return systemScheme === 'dark';
    }
    return themePreference === 'dark';
  }, [themePreference, systemScheme]);

  const theme: Theme = useMemo(
    () => {
      const baseColors = isDark ? darkColors : lightColors;
      const flavorColors = getFlavorColors(themeFlavor, isDark);
      
      return {
        colors: flavorColors || baseColors,
        typography,
        spacing,
        borderRadius,
        iconSize,
        shadows: isDark ? shadowsDark : shadows,
        priorityColors: isDark ? priorityColorsDark : priorityColors,
        isDark,
      };
    },
    [isDark, themeFlavor]
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}
