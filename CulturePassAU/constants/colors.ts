import { Platform } from 'react-native';

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export type ColorTheme = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGlow: string;
  primarySoft: string;

  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  accent: string;
  accentLight: string;

  gold: string;

  background: string;
  backgroundSecondary: string;

  surface: string;
  surfaceElevated: string;
  surfaceSecondary: string;

  border: string;
  borderLight: string;
  divider: string;

  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  success: string;
  warning: string;
  error: string;
  info: string;

  overlay: string;
  tabIconDefault: string;
  tabIconSelected: string;
  card: string;
  cardBorder: string;

  tabBar: string;
  tabBarBorder: string;

  tint: string;
};

const base = {
  primary: '#007AFF',
  primaryLight: '#409CFF',
  primaryDark: '#0056CC',
  primaryGlow: 'rgba(0, 122, 255, 0.15)',
  primarySoft: 'rgba(0, 122, 255, 0.08)',

  secondary: '#5856D6',
  secondaryLight: '#7A79E0',
  secondaryDark: '#3634A3',

  accent: '#FF9500',
  accentLight: '#FFBF66',

  gold: '#FFD700',

  success: '#34C759',
  warning: '#FF9F0A',
  error: '#FF3B30',
  info: '#5AC8FA',

  overlay: 'rgba(0,0,0,0.5)',
} as const;

export const light: ColorTheme = {
  ...base,

  background: '#F2F2F7',
  backgroundSecondary: '#EFEFF4',

  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',

  border: '#D1D1D6',
  borderLight: '#E5E5EA',
  divider: '#C6C6C8',

  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  textInverse: '#FFFFFF',

  card: '#FFFFFF',
  cardBorder: '#E5E5EA',

  tabBar: '#F9F9F9',
  tabBarBorder: '#D1D1D6',
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#007AFF',

  tint: '#007AFF',
};

export const dark: ColorTheme = {
  ...base,

  background: '#0A0A0F',
  backgroundSecondary: '#111118',

  surface: '#1A1A22',
  surfaceElevated: '#222230',
  surfaceSecondary: '#141419',

  border: '#2A2A35',
  borderLight: '#2A2A35',
  divider: '#1A1A22',

  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  textInverse: '#000000',

  card: '#1A1A22',
  cardBorder: '#2A2A35',

  tabBar: '#0A0A0F',
  tabBarBorder: '#1A1A22',
  tabIconDefault: '#636366',
  tabIconSelected: '#007AFF',

  tint: '#007AFF',
};

export const shadows = {
  small: {
    shadowColor: Platform.select({ ios: '#000', default: '#000' }),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  } satisfies ShadowStyle,

  medium: {
    shadowColor: Platform.select({ ios: '#000', default: '#000' }),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  } satisfies ShadowStyle,

  large: {
    shadowColor: Platform.select({ ios: '#000', default: '#000' }),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  } satisfies ShadowStyle,

  heavy: {
    shadowColor: Platform.select({ ios: '#000', default: '#000' }),
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  } satisfies ShadowStyle,
};

const Colors = {
  ...dark,
  light,
  dark,
  shadow: shadows,
  shadows,
} as const;

export default Colors;
