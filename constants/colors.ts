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
  primary: '#00D4AA',
  primaryLight: '#33DDBB',
  primaryDark: '#00A882',
  primaryGlow: 'rgba(0, 212, 170, 0.15)',
  primarySoft: 'rgba(0, 212, 170, 0.07)',

  secondary: '#7C3AED',
  secondaryLight: '#9F67FF',
  secondaryDark: '#5B21B6',

  accent: '#FF6B35',
  accentLight: '#FFB347',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  overlay: 'rgba(0,0,0,0.44)',
} as const;

export const light: ColorTheme = {
  ...base,

  background: '#F8F9FA',
  backgroundSecondary: '#F0F2F5',

  surface: '#FFFFFF',
  surfaceElevated: '#F0F2F5',
  surfaceSecondary: '#F8F9FA',

  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  divider: '#E2E8F0',

  text: '#0D0F14',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  card: '#FFFFFF',
  cardBorder: '#E2E8F0',

  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabIconDefault: '#94A3B8',
  tabIconSelected: '#00D4AA',

  tint: '#00D4AA',
};

export const dark: ColorTheme = {
  ...base,

  background: '#0D0F14',
  backgroundSecondary: '#161B27',

  surface: '#161B27',
  surfaceElevated: '#1E2535',
  surfaceSecondary: '#1E2535',

  border: '#2D3748',
  borderLight: '#374151',
  divider: '#2D3748',

  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#475569',
  textInverse: '#0D0F14',

  card: '#1E2535',
  cardBorder: '#2D3748',

  tabBar: '#161B27',
  tabBarBorder: '#2D3748',
  tabIconDefault: '#475569',
  tabIconSelected: '#00D4AA',

  tint: '#00D4AA',
};

export const shadows = {
  small: {
    shadowColor: Platform.select({ ios: '#0D0F14', default: '#000' }),
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3.5,
    elevation: 2.5,
  } satisfies ShadowStyle,

  medium: {
    shadowColor: Platform.select({ ios: '#0D0F14', default: '#000' }),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  } satisfies ShadowStyle,

  large: {
    shadowColor: Platform.select({ ios: '#0D0F14', default: '#000' }),
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 10,
  } satisfies ShadowStyle,

  heavy: {
    shadowColor: Platform.select({ ios: '#0D0F14', default: '#000' }),
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 16,
  } satisfies ShadowStyle,
};

const Colors = {
  ...light,
  light,
  dark,
  shadow: shadows,
  shadows,
} as const;

export default Colors;
