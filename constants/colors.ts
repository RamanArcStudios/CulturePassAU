// constants/colors.ts
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

// Colors that stay exactly the same regardless of light/dark mode
const sharedBase = {
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

  overlay: 'rgba(0,0,0,0.4)', // Slightly darkened for better modal pop
} as const;

export const light: ColorTheme = {
  ...sharedBase,

  // Primary - Deep blue for crisp visibility on light backgrounds
  primary: '#007AFF',
  primaryLight: '#409CFF',
  primaryDark: '#0056CC',
  primaryGlow: 'rgba(0, 122, 255, 0.10)',
  primarySoft: 'rgba(0, 122, 255, 0.05)',

  // Backgrounds - Pure white base, off-white secondary
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',

  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',

  border: '#D1D1D6',
  borderLight: '#E5E5EA',
  divider: '#E5E5EA',

  text: '#000000', // Pure black headers read better than #1C1C1E
  textSecondary: '#6E6E73',
  textTertiary: '#AEAEB2',
  textInverse: '#FFFFFF',

  card: '#FFFFFF',
  cardBorder: '#E5E5EA', // Fixed to match borderLight

  tabBar: 'rgba(255,255,255,0.92)',
  tabBarBorder: 'rgba(0,0,0,0.1)',
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#007AFF',

  tint: '#007AFF',
};

export const dark: ColorTheme = {
  ...sharedBase,

  // Primary - Lighter, more vibrant blue to pop against pure black
  primary: '#0A84FF',
  primaryLight: '#5EACFF',
  primaryDark: '#0061D6',
  primaryGlow: 'rgba(10, 132, 255, 0.15)',
  primarySoft: 'rgba(10, 132, 255, 0.10)',

  // Backgrounds - Pure black base, elevated grays
  background: '#000000',
  backgroundSecondary: '#1C1C1E',

  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  surfaceSecondary: '#2C2C2E',

  border: '#38383A',
  borderLight: '#48484A',
  divider: '#38383A',

  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  textInverse: '#000000', // Fixed to pure black for contrast on inverse elements

  card: '#1C1C1E',
  cardBorder: '#38383A',

  tabBar: 'rgba(28,28,30,0.92)',
  tabBarBorder: 'rgba(255,255,255,0.1)',
  tabIconDefault: '#636366',
  tabIconSelected: '#0A84FF',

  tint: '#0A84FF',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  } satisfies ShadowStyle,

  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Slightly increased for a cleaner lift
    shadowRadius: 8,
    elevation: 3,
  } satisfies ShadowStyle,

  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, // More pronounced for modals/popovers
    shadowRadius: 16,
    elevation: 6,
  } satisfies ShadowStyle,

  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  } satisfies ShadowStyle,
};

/**
 * Glassmorphism and futuristic surface presets.
 * Use these on cards/modals for a modern frosted-glass feel.
 */
export const glass = {
  light: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  dark: {
    backgroundColor: 'rgba(28,28,30,0.72)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  /** Semi-transparent overlay for modals/popovers */
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
} as const;

/**
 * Gradient tuples ready for LinearGradient `colors` prop.
 * Each pair is [start, end].
 */
export const gradients = {
  /** Primary brand gradient */
  primary: ['#007AFF', '#5856D6'] as [string, string],
  /** Warm accent gradient for CTAs and highlights */
  accent: ['#FF9500', '#FF6B6B'] as [string, string],
  /** Premium gold gradient for membership/pro badges */
  gold: ['#FFD700', '#F4A100'] as [string, string],
  /** Dark surface gradient for cards on dark mode */
  darkSurface: ['#1C1C1E', '#2C2C2E'] as [string, string],
  /** Hero banner overlay (transparent → dark) */
  heroOverlay: ['transparent', 'rgba(0,0,0,0.75)'] as [string, string],
  /** Success / positive action */
  success: ['#34C759', '#30B050'] as [string, string],
} as const;

const Colors = {
  ...light, // Default export maps to light mode variables
  light,
  dark,
  shadow: shadows,
  shadows,
  glass,
  gradients,
} as const;

export default Colors;