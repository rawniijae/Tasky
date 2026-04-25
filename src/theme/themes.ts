import type { ThemeColors } from './colors';

// ─── Theme Flavor ID ─────────────────────────────────────────
export type ThemeFlavor =
  | 'default'
  | 'hello_kitty'
  | 'emo'
  | 'anime'
  | 'ocean'
  | 'sunset'
  | 'water';

export interface ThemeFlavorMeta {
  id: ThemeFlavor;
  name: string;
  icon: string;
  preview: [string, string, string]; // 3 preview colors
}

export const THEME_FLAVORS: ThemeFlavorMeta[] = [
  {
    id: 'default',
    name: 'Default',
    icon: '💎',
    preview: ['#6366F1', '#818CF8', '#0F172A'],
  },
  {
    id: 'hello_kitty',
    name: 'Hello Kitty',
    icon: '🎀',
    preview: ['#FF6B9D', '#FFFFFF', '#FF1493'],
  },
  {
    id: 'emo',
    name: 'Emo',
    icon: '🖤',
    preview: ['#8B0000', '#1A1A2E', '#0D0D0D'],
  },
  {
    id: 'anime',
    name: 'Anime',
    icon: '🌳',
    preview: ['#4CAF50', '#81C784', '#F1F8E9'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: '🌊',
    preview: ['#0077B6', '#00B4D8', '#CAF0F8'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    icon: '🌅',
    preview: ['#FF6B6B', '#FFA07A', '#2D1B69'],
  },
  {
    id: 'water',
    name: 'Water',
    icon: '💧',
    preview: ['#00BFFF', '#E0FFFF', '#00008B'],
  },
];

const helloKittyLight: ThemeColors = {
  background: '#FFFFFF',
  backgroundSecondary: '#FFF5F8',
  backgroundTertiary: '#FFE4ED',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  glassBg: 'rgba(255,255,255,0.85)',
  glassBorder: 'rgba(255,107,157,0.3)',
  glassHighlight: 'rgba(255,255,255,0.95)',

  text: '#E60012',
  textSecondary: '#FF6B9D',
  textTertiary: '#FFB8D0',
  textInverse: '#FFFFFF',

  primary: '#FF6B9D',
  primaryLight: '#FFB8D0',
  primaryDark: '#FF1493',

  success: '#E60012', // Red like the bow
  warning: '#FFD700',
  danger: '#D32F2F',
  info: '#87CEEB',

  border: '#FFE4ED',
  borderLight: '#FFF5F8',
  divider: '#FFE4ED',
  shadow: 'rgba(255,107,157,0.15)',
  overlay: 'rgba(230,0,18,0.3)',

  tabBar: 'rgba(255,255,255,0.95)',
  tabBarBorder: 'rgba(255,107,157,0.2)',
  tabActive: '#E60012',
  tabInactive: '#FFB8D0',

  inputBg: '#FFF5F8',
  inputBorder: '#FFE4ED',
  inputFocusBorder: '#FF6B9D',
  placeholder: '#FFB8D0',

  cardBg: 'rgba(255, 255, 255, 0.6)',
  cardBorder: 'rgba(255, 107, 157, 0.2)',

  gradientStart: '#FF6B9D',
  gradientEnd: '#FF1493',
};

const helloKittyDark: ThemeColors = {
  background: '#1A0005',
  backgroundSecondary: '#2D0A1F',
  backgroundTertiary: '#3D1530',
  surface: '#2D0A1F',
  surfaceElevated: '#3D1530',

  glassBg: 'rgba(45,10,31,0.8)',
  glassBorder: 'rgba(255,107,157,0.3)',
  glassHighlight: 'rgba(61,21,48,0.5)',

  text: '#FFF0F5',
  textSecondary: '#FFB8D0',
  textTertiary: '#FF6B9D',
  textInverse: '#1A0005',

  primary: '#FF6B9D',
  primaryLight: '#FFB8D0',
  primaryDark: '#FF1493',

  success: '#FF1493',
  warning: '#FFD700',
  danger: '#FF5252',
  info: '#87CEEB',

  border: '#3D1530',
  borderLight: '#2D0A1F',
  divider: '#3D1530',
  shadow: 'rgba(0,0,0,0.5)',
  overlay: 'rgba(0,0,0,0.7)',

  tabBar: 'rgba(26,0,5,0.95)',
  tabBarBorder: 'rgba(255,107,157,0.25)',
  tabActive: '#FF6B9D',
  tabInactive: '#3D1530',

  inputBg: '#2D0A1F',
  inputBorder: '#3D1530',
  inputFocusBorder: '#FF6B9D',
  placeholder: '#3D1530',

  cardBg: 'rgba(45, 10, 31, 0.6)',
  cardBorder: 'rgba(255, 107, 157, 0.2)',

  gradientStart: '#FF6B9D',
  gradientEnd: '#FF1493',
};

// ─── Emo Theme ──────────────────────────────────────────────
const emoLight: ThemeColors = {
  background: '#1A1A2E',
  backgroundSecondary: '#16213E',
  backgroundTertiary: '#0F3460',
  surface: '#16213E',
  surfaceElevated: '#0F3460',

  glassBg: 'rgba(22,33,62,0.8)',
  glassBorder: 'rgba(139,0,0,0.3)',
  glassHighlight: 'rgba(15,52,96,0.5)',

  text: '#E0E0E0',
  textSecondary: '#A0A0A0',
  textTertiary: '#707070',
  textInverse: '#0D0D0D',

  primary: '#8B0000',
  primaryLight: '#B22222',
  primaryDark: '#660000',

  success: '#2E8B57',
  warning: '#DAA520',
  danger: '#DC143C',
  info: '#4682B4',

  border: '#2A2A4E',
  borderLight: '#1A1A2E',
  divider: '#2A2A4E',
  shadow: 'rgba(0,0,0,0.5)',
  overlay: 'rgba(0,0,0,0.7)',

  tabBar: 'rgba(13,13,13,0.95)',
  tabBarBorder: 'rgba(139,0,0,0.3)',
  tabActive: '#DC143C',
  tabInactive: '#707070',

  inputBg: '#16213E',
  inputBorder: '#2A2A4E',
  inputFocusBorder: '#8B0000',
  placeholder: '#707070',

  cardBg: 'rgba(22, 33, 62, 0.5)',
  cardBorder: 'rgba(139, 0, 0, 0.15)',

  gradientStart: '#8B0000',
  gradientEnd: '#DC143C',
};

const emoDark: ThemeColors = {
  background: '#0D0D0D',
  backgroundSecondary: '#1A1A1A',
  backgroundTertiary: '#262626',
  surface: '#1A1A1A',
  surfaceElevated: '#262626',

  glassBg: 'rgba(13,13,13,0.85)',
  glassBorder: 'rgba(139,0,0,0.25)',
  glassHighlight: 'rgba(26,26,26,0.5)',

  text: '#C0C0C0',
  textSecondary: '#808080',
  textTertiary: '#555555',
  textInverse: '#0D0D0D',

  primary: '#DC143C',
  primaryLight: '#FF4060',
  primaryDark: '#8B0000',

  success: '#2E8B57',
  warning: '#B8860B',
  danger: '#FF0000',
  info: '#4169E1',

  border: '#333333',
  borderLight: '#1A1A1A',
  divider: '#333333',
  shadow: 'rgba(0,0,0,0.6)',
  overlay: 'rgba(0,0,0,0.8)',

  tabBar: 'rgba(13,13,13,0.95)',
  tabBarBorder: 'rgba(139,0,0,0.2)',
  tabActive: '#DC143C',
  tabInactive: '#555555',

  inputBg: '#1A1A1A',
  inputBorder: '#333333',
  inputFocusBorder: '#DC143C',
  placeholder: '#555555',

  cardBg: 'rgba(26, 26, 26, 0.5)',
  cardBorder: 'rgba(220, 20, 60, 0.1)',

  gradientStart: '#8B0000',
  gradientEnd: '#4B0082',
};

// ─── Anime Theme ────────────────────────────────────────────
const animeLight: ThemeColors = {
  background: '#F1F8E9',
  backgroundSecondary: '#DCEDC8',
  backgroundTertiary: '#C5E1A5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  glassBg: 'rgba(255,255,255,0.78)',
  glassBorder: 'rgba(76,175,80,0.3)',
  glassHighlight: 'rgba(255,255,255,0.9)',

  text: '#1B5E20',
  textSecondary: '#388E3C',
  textTertiary: '#66BB6A',
  textInverse: '#FFFFFF',

  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',

  success: '#2E7D32',
  warning: '#FFD54F',
  danger: '#FF5252',
  info: '#4FC3F7',

  border: '#DCEDC8',
  borderLight: '#F1F8E9',
  divider: '#C5E1A5',
  shadow: 'rgba(76,175,80,0.1)',
  overlay: 'rgba(27,94,32,0.4)',

  tabBar: 'rgba(241,248,233,0.92)',
  tabBarBorder: 'rgba(76,175,80,0.3)',
  tabActive: '#4CAF50',
  tabInactive: '#66BB6A',

  inputBg: '#DCEDC8',
  inputBorder: '#C5E1A5',
  inputFocusBorder: '#4CAF50',
  placeholder: '#66BB6A',

  cardBg: 'rgba(255, 255, 255, 0.4)',
  cardBorder: 'rgba(76, 175, 80, 0.15)',

  gradientStart: '#4CAF50',
  gradientEnd: '#FFD54F',
};

const animeDark: ThemeColors = {
  background: '#1B3320',
  backgroundSecondary: '#2E4D36',
  backgroundTertiary: '#3B5E45',
  surface: '#2E4D36',
  surfaceElevated: '#3B5E45',

  glassBg: 'rgba(46,77,54,0.78)',
  glassBorder: 'rgba(76,175,80,0.25)',
  glassHighlight: 'rgba(59,94,69,0.5)',

  text: '#F1F8E9',
  textSecondary: '#A5D6A7',
  textTertiary: '#66BB6A',
  textInverse: '#1B3320',

  primary: '#81C784',
  primaryLight: '#A5D6A7',
  primaryDark: '#4CAF50',

  success: '#34D399',
  warning: '#FFD54F',
  danger: '#FF5588',
  info: '#4FC3F7',

  border: '#3B5E45',
  borderLight: '#2E4D36',
  divider: '#3B5E45',
  shadow: 'rgba(0,0,0,0.4)',
  overlay: 'rgba(0,0,0,0.6)',

  tabBar: 'rgba(27,51,32,0.95)',
  tabBarBorder: 'rgba(76,175,80,0.2)',
  tabActive: '#81C784',
  tabInactive: '#66BB6A',

  inputBg: '#2E4D36',
  inputBorder: '#3B5E45',
  inputFocusBorder: '#81C784',
  placeholder: '#66BB6A',

  cardBg: 'rgba(46, 77, 54, 0.5)',
  cardBorder: 'rgba(76, 175, 80, 0.15)',

  gradientStart: '#4CAF50',
  gradientEnd: '#FFD54F',
};

// ─── Ocean Theme ────────────────────────────────────────────
const oceanLight: ThemeColors = {
  background: '#F0F9FF',
  backgroundSecondary: '#E0F2FE',
  backgroundTertiary: '#BAE6FD',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  glassBg: 'rgba(255,255,255,0.75)',
  glassBorder: 'rgba(0,119,182,0.2)',
  glassHighlight: 'rgba(255,255,255,0.9)',

  text: '#023E5F',
  textSecondary: '#0369A1',
  textTertiary: '#7DD3FC',
  textInverse: '#FFFFFF',

  primary: '#0077B6',
  primaryLight: '#00B4D8',
  primaryDark: '#005F8A',

  success: '#06D6A0',
  warning: '#FFD166',
  danger: '#EF476F',
  info: '#118AB2',

  border: '#BAE6FD',
  borderLight: '#E0F2FE',
  divider: '#BAE6FD',
  shadow: 'rgba(0,119,182,0.1)',
  overlay: 'rgba(2,62,95,0.4)',

  tabBar: 'rgba(240,249,255,0.92)',
  tabBarBorder: 'rgba(0,119,182,0.2)',
  tabActive: '#0077B6',
  tabInactive: '#7DD3FC',

  inputBg: '#E0F2FE',
  inputBorder: '#BAE6FD',
  inputFocusBorder: '#0077B6',
  placeholder: '#7DD3FC',

  cardBg: 'rgba(255, 255, 255, 0.4)',
  cardBorder: 'rgba(0, 180, 216, 0.15)',

  gradientStart: '#0077B6',
  gradientEnd: '#00B4D8',
};

const oceanDark: ThemeColors = {
  background: '#03111A',
  backgroundSecondary: '#0A1929',
  backgroundTertiary: '#132F4C',
  surface: '#0A1929',
  surfaceElevated: '#132F4C',

  glassBg: 'rgba(10,25,41,0.8)',
  glassBorder: 'rgba(0,180,216,0.2)',
  glassHighlight: 'rgba(19,47,76,0.5)',

  text: '#E0F2FE',
  textSecondary: '#7DD3FC',
  textTertiary: '#0369A1',
  textInverse: '#03111A',

  primary: '#00B4D8',
  primaryLight: '#48CAE4',
  primaryDark: '#0077B6',

  success: '#06D6A0',
  warning: '#FFD166',
  danger: '#EF476F',
  info: '#48CAE4',

  border: '#132F4C',
  borderLight: '#0A1929',
  divider: '#132F4C',
  shadow: 'rgba(0,0,0,0.4)',
  overlay: 'rgba(0,0,0,0.6)',

  tabBar: 'rgba(3,17,26,0.95)',
  tabBarBorder: 'rgba(0,180,216,0.2)',
  tabActive: '#00B4D8',
  tabInactive: '#0369A1',

  inputBg: '#0A1929',
  inputBorder: '#132F4C',
  inputFocusBorder: '#00B4D8',
  placeholder: '#0369A1',

  cardBg: 'rgba(10, 25, 41, 0.5)',
  cardBorder: 'rgba(0, 180, 216, 0.1)',

  gradientStart: '#0077B6',
  gradientEnd: '#00B4D8',
};

// ─── Sunset Theme ───────────────────────────────────────────
const sunsetLight: ThemeColors = {
  background: '#FFF5F5',
  backgroundSecondary: '#FFE8E8',
  backgroundTertiary: '#FFD6D6',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  glassBg: 'rgba(255,255,255,0.75)',
  glassBorder: 'rgba(255,107,107,0.3)',
  glassHighlight: 'rgba(255,255,255,0.9)',

  text: '#2D1B69',
  textSecondary: '#6B4C9A',
  textTertiary: '#A88BBE',
  textInverse: '#FFFFFF',

  primary: '#FF6B6B',
  primaryLight: '#FFA07A',
  primaryDark: '#E04E4E',

  success: '#66BB6A',
  warning: '#FFB74D',
  danger: '#EF5350',
  info: '#42A5F5',

  border: '#FFD6D6',
  borderLight: '#FFE8E8',
  divider: '#FFD6D6',
  shadow: 'rgba(255,107,107,0.1)',
  overlay: 'rgba(45,27,105,0.4)',

  tabBar: 'rgba(255,245,245,0.92)',
  tabBarBorder: 'rgba(255,107,107,0.3)',
  tabActive: '#FF6B6B',
  tabInactive: '#A88BBE',

  inputBg: '#FFE8E8',
  inputBorder: '#FFD6D6',
  inputFocusBorder: '#FF6B6B',
  placeholder: '#A88BBE',

  cardBg: 'rgba(255, 255, 255, 0.4)',
  cardBorder: 'rgba(255, 160, 122, 0.2)',

  gradientStart: '#FF6B6B',
  gradientEnd: '#FFA07A',
};

const sunsetDark: ThemeColors = {
  background: '#1A0F2E',
  backgroundSecondary: '#2D1B50',
  backgroundTertiary: '#3D2666',
  surface: '#2D1B50',
  surfaceElevated: '#3D2666',

  glassBg: 'rgba(45,27,80,0.78)',
  glassBorder: 'rgba(255,107,107,0.25)',
  glassHighlight: 'rgba(61,38,102,0.5)',

  text: '#FFE8E8',
  textSecondary: '#C4A0C4',
  textTertiary: '#7A5D8A',
  textInverse: '#1A0F2E',

  primary: '#FF8080',
  primaryLight: '#FFB0A0',
  primaryDark: '#FF6B6B',

  success: '#66BB6A',
  warning: '#FFB74D',
  danger: '#FF5252',
  info: '#64B5F6',

  border: '#3D2666',
  borderLight: '#2D1B50',
  divider: '#3D2666',
  shadow: 'rgba(0,0,0,0.4)',
  overlay: 'rgba(0,0,0,0.6)',

  tabBar: 'rgba(26,15,46,0.95)',
  tabBarBorder: 'rgba(255,107,107,0.2)',
  tabActive: '#FF8080',
  tabInactive: '#7A5D8A',

  inputBg: '#2D1B50',
  inputBorder: '#3D2666',
  inputFocusBorder: '#FF8080',
  placeholder: '#7A5D8A',

  cardBg: 'rgba(45, 27, 80, 0.5)',
  cardBorder: 'rgba(255, 107, 107, 0.15)',

  gradientStart: '#FF6B6B',
  gradientEnd: '#FFA07A',
};

const waterLight: ThemeColors = {
  background: '#E0F7FA',
  backgroundSecondary: 'rgba(0, 191, 255, 0.05)',
  backgroundTertiary: 'rgba(0, 191, 255, 0.1)',
  surface: 'transparent',
  surfaceElevated: 'rgba(255, 255, 255, 0.1)',

  glassBg: 'rgba(255,255,255,0.15)',
  glassBorder: 'rgba(0,191,255,0.2)',
  glassHighlight: 'rgba(255,255,255,0.3)',

  text: '#004D40',
  textSecondary: '#00695C',
  textTertiary: '#00897B',
  textInverse: '#FFFFFF',

  primary: '#00BFFF',
  primaryLight: '#B2EBF2',
  primaryDark: '#0091EA',

  success: '#00B8D4',
  warning: '#FFD600',
  danger: '#FF5252',
  info: '#00B0FF',

  border: 'rgba(0, 191, 255, 0.1)',
  borderLight: 'rgba(0, 191, 255, 0.05)',
  divider: 'rgba(0, 191, 255, 0.1)',
  shadow: 'transparent',
  overlay: 'rgba(0,96,100,0.3)',

  tabBar: 'rgba(224,247,250,0.7)',
  tabBarBorder: 'rgba(0,191,255,0.1)',
  tabActive: '#00BFFF',
  tabInactive: '#00897B',

  inputBg: 'rgba(255, 255, 255, 0.2)',
  inputBorder: 'rgba(0, 191, 255, 0.1)',
  inputFocusBorder: '#00BFFF',
  placeholder: '#00897B',

  cardBg: 'transparent',
  cardBorder: 'rgba(0, 191, 255, 0.1)',

  gradientStart: '#00BFFF',
  gradientEnd: '#E0FFFF',
};

const waterDark: ThemeColors = {
  background: '#001921',
  backgroundSecondary: 'rgba(0, 229, 255, 0.05)',
  backgroundTertiary: 'rgba(0, 229, 255, 0.1)',
  surface: 'rgba(0, 44, 56, 0.4)',
  surfaceElevated: 'rgba(0, 62, 77, 0.5)',

  glassBg: 'rgba(0,44,56,0.5)',
  glassBorder: 'rgba(0,191,255,0.2)',
  glassHighlight: 'rgba(0,62,77,0.3)',

  text: '#E0F7FA',
  textSecondary: '#B2EBF2',
  textTertiary: '#80DEEA',
  textInverse: '#001921',

  primary: '#00E5FF',
  primaryLight: '#B2EBF2',
  primaryDark: '#00BFFF',

  success: '#00E5FF',
  warning: '#FFF176',
  danger: '#FF5252',
  info: '#00B0FF',

  border: 'rgba(0, 191, 255, 0.15)',
  borderLight: 'rgba(0, 44, 56, 0.2)',
  divider: 'rgba(0, 62, 77, 0.2)',
  shadow: 'rgba(0,0,0,0.4)',
  overlay: 'rgba(0,0,0,0.7)',

  tabBar: 'rgba(0,25,33,0.9)',
  tabBarBorder: 'rgba(0,191,255,0.2)',
  tabActive: '#00E5FF',
  tabInactive: '#80DEEA',

  inputBg: 'rgba(0, 44, 56, 0.5)',
  inputBorder: 'rgba(0, 62, 77, 0.3)',
  inputFocusBorder: '#00E5FF',
  placeholder: '#80DEEA',

  cardBg: 'rgba(0, 44, 56, 0.4)',
  cardBorder: 'rgba(0, 191, 255, 0.15)',

  gradientStart: '#00BFFF',
  gradientEnd: '#00008B',
};

// ─── Theme Color Map ────────────────────────────────────────
export function getFlavorColors(
  flavor: ThemeFlavor,
  isDark: boolean
): ThemeColors | null {
  // null means use default light/dark
  if (flavor === 'default') return null;

  const map: Record<Exclude<ThemeFlavor, 'default'>, { light: ThemeColors; dark: ThemeColors }> = {
    hello_kitty: { light: helloKittyLight, dark: helloKittyDark },
    emo: { light: emoLight, dark: emoDark },
    anime: { light: animeLight, dark: animeDark },
    ocean: { light: oceanLight, dark: oceanDark },
    sunset: { light: sunsetLight, dark: sunsetDark },
    water: { light: waterLight, dark: waterDark },
  };

  return isDark ? map[flavor].dark : map[flavor].light;
}
