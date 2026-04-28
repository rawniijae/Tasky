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

  const isDarkPreference = useMemo(() => {
    if (themePreference === 'system') {
      return systemScheme === 'dark';
    }
    return themePreference === 'dark';
  }, [themePreference, systemScheme]);

  const theme: Theme = useMemo(
    () => {
      const baseColors = isDarkPreference ? darkColors : lightColors;
      const flavorColors = getFlavorColors(themeFlavor, isDarkPreference);
      const activeColors = flavorColors || baseColors;
      
      // Determine if the actual background color is dark
      // Simple luminance check: (R*0.299 + G*0.587 + B*0.114)
      const isActuallyDark = (() => {
        const bg = activeColors.background;
        if (bg.startsWith('#')) {
          const hex = bg.slice(1);
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
        }
        return isDarkPreference; // Fallback
      })();

      return {
        colors: activeColors,
        typography,
        spacing,
        borderRadius,
        iconSize,
        shadows: isActuallyDark ? shadowsDark : shadows,
        priorityColors: isActuallyDark ? priorityColorsDark : priorityColors,
        isDark: isActuallyDark,
      };
    },
    [isDarkPreference, themeFlavor]
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
