export const palette = {
  // Primary brand
  indigo: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  // Accent
  violet: {
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
  },
  // Success
  emerald: {
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
  },
  // Warning
  amber: {
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
  // Danger
  rose: {
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
  },
  // Info
  sky: {
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
  },
  // Neutrals
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    850: '#172033',
    900: '#0F172A',
    950: '#020617',
  },
} as const;

export interface PriorityColorInfo {
  bg: string;
  text: string;
  accent: string;
}

export interface PriorityColorSet {
  p1: PriorityColorInfo;
  p2: PriorityColorInfo;
  p3: PriorityColorInfo;
  p4: PriorityColorInfo;
}

// ─── Priority Colors ─────────────────────────────────────────
export const priorityColors: PriorityColorSet = {
  p1: { bg: '#FEE2E2', text: '#DC2626', accent: '#EF4444' },
  p2: { bg: '#FEF3C7', text: '#D97706', accent: '#F59E0B' },
  p3: { bg: '#DBEAFE', text: '#2563EB', accent: '#3B82F6' },
  p4: { bg: '#F1F5F9', text: '#64748B', accent: '#94A3B8' },
};

export const priorityColorsDark: PriorityColorSet = {
  p1: { bg: 'rgba(239,68,68,0.15)', text: '#FCA5A5', accent: '#EF4444' },
  p2: { bg: 'rgba(245,158,11,0.15)', text: '#FCD34D', accent: '#F59E0B' },
  p3: { bg: 'rgba(59,130,246,0.15)', text: '#93C5FD', accent: '#3B82F6' },
  p4: { bg: 'rgba(100,116,139,0.15)', text: '#94A3B8', accent: '#64748B' },
};

// ─── Theme Colors ────────────────────────────────────────────
export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceElevated: string;

  // Glass
  glassBg: string;
  glassBorder: string;
  glassHighlight: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Semantic
  success: string;
  warning: string;
  danger: string;
  info: string;

  // UI
  border: string;
  borderLight: string;
  divider: string;
  shadow: string;
  overlay: string;

  // Tab bar
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;

  // Input
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  placeholder: string;

  // Card
  cardBg: string;
  cardBorder: string;

  // Gradient
  gradientStart: string;
  gradientEnd: string;
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  backgroundTertiary: '#E2E8F0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  glassBg: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.5)',
  glassHighlight: 'rgba(255,255,255,0.9)',

  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  success: '#10B981',
  warning: '#F59E0B',
  danger: '#F43F5E',
  info: '#0EA5E9',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',
  shadow: 'rgba(15,23,42,0.08)',
  overlay: 'rgba(15,23,42,0.5)',

  tabBar: 'rgba(255,255,255,0.88)',
  tabBarBorder: 'rgba(226,232,240,0.8)',
  tabActive: '#6366F1',
  tabInactive: '#94A3B8',

  inputBg: '#F1F5F9',
  inputBorder: '#E2E8F0',
  inputFocusBorder: '#6366F1',
  placeholder: '#94A3B8',

  cardBg: 'rgba(255, 255, 255, 0.4)',
  cardBorder: 'rgba(226, 232, 240, 0.5)',

  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
};

export const darkColors: ThemeColors = {
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',
  surface: '#1E293B',
  surfaceElevated: '#334155',

  glassBg: 'rgba(30,41,59,0.72)',
  glassBorder: 'rgba(51,65,85,0.5)',
  glassHighlight: 'rgba(51,65,85,0.4)',

  text: '#F1F5F9',
  textSecondary: '#CBD5E1', // Brightened from #94A3B8
  textTertiary: '#94A3B8', // Brightened from #64748B
  textInverse: '#0F172A',

  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',

  success: '#34D399',
  warning: '#FBBF24',
  danger: '#FB7185',
  info: '#38BDF8',

  border: '#334155',
  borderLight: '#1E293B',
  divider: '#334155',
  shadow: 'rgba(0,0,0,0.3)',
  overlay: 'rgba(0,0,0,0.6)',

  tabBar: 'rgba(15,23,42,0.88)',
  tabBarBorder: 'rgba(51,65,85,0.5)',
  tabActive: '#818CF8',
  tabInactive: '#94A3B8',

  inputBg: '#1E293B',
  inputBorder: '#334155',
  inputFocusBorder: '#818CF8',
  placeholder: '#94A3B8',

  cardBg: 'rgba(30, 41, 59, 0.5)',
  cardBorder: 'rgba(71, 85, 105, 0.4)', // Slightly more visible border

  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
};
