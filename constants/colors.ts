import { Platform, useColorScheme } from 'react-native';

/**
 * CulturePassAU Sydney Color System v2.0
 * Kerala-inspired blues + Sydney gold accents
 * iOS Human Interface + Material Design hybrid
 */

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export type ColorTheme = {
  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGlow: string;
  primarySoft: string;
  
  // Secondary brand
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Accents
  accent: string;
  accentLight: string;
  gold: string;
  
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  
  // Surfaces
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  
  // Borders
  border: string;
  borderLight: string;
  divider: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // UI Elements
  tabBar: string;
  tabBarBorder: string;
  tabIconDefault: string;
  tabIconSelected: string;
  
  // Legacy (for backwards compatibility)
  surface: string;
  surfaceElevated: string;
  card: string;
  cardBorder: string;
  text: string;
  tint: string;
};

// Shared colors (identical light/dark)
const shared = {
  // Kerala-inspired secondary blue
  secondary: '#5856D6',
  secondaryLight: '#7A79E0', 
  secondaryDark: '#3634A3',
  
  // Sydney sunset orange accent
  accent: '#FF9500',
  accentLight: '#FFB347',
  
  // Cultural gold (Kerala festivals)
  gold: '#FFD700',
  
  // Status colors (iOS standard)
  success: '#34C759',
  warning: '#FF9F0A',
  error: '#FF3B30',
  info: '#5AC8FA',
} as const;

// LIGHT MODE - Crisp Sydney daylight
export const light: ColorTheme = {
  ...shared,
  
  // Primary Kerala ocean blue
  primary: '#007AFF',
  primaryLight: '#40B0FF',
  primaryDark: '#005BB5',
  primaryGlow: 'rgba(0, 122, 255, 0.08)',
  primarySoft: 'rgba(0, 122, 255, 0.04)',
  
  // Crisp backgrounds
  background: '#FAFAFA',
  backgroundSecondary: '#F8F9FA',
  
  // Surface hierarchy
  surfacePrimary: '#FFFFFF',
  surfaceSecondary: '#F8F9FA', 
  surfaceTertiary: '#F0F0F2',
  
  // Subtle borders
  border: '#E0E0E5',
  borderLight: '#F0F0F2',
  divider: '#E5E5E8',
  
  // Text hierarchy (pure black = best readability)
  textPrimary: '#1C1C1E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Legacy mappings
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#1C1C1E',
  tint: '#007AFF',
  card: '#FFFFFF',
  cardBorder: '#F0F0F2',
  tabBar: 'rgba(255,255,255,0.95)',
  tabBarBorder: 'rgba(0,0,0,0.05)',
  tabIconDefault: '#8B919F',
  tabIconSelected: '#007AFF',
};

// DARK MODE - Kerala night markets + Sydney nightlife
export const dark: ColorTheme = {
  ...shared,
  
  // Vibrant blue pops against black
  primary: '#60B5FF',
  primaryLight: '#8BC8FF',
  primaryDark: '#3B8ED9',
  primaryGlow: 'rgba(96, 181, 255, 0.15)',
  primarySoft: 'rgba(96, 181, 255, 0.08)',
  
  // True black base
  background: '#0A0A0B',
  backgroundSecondary: '#17181A',
  
  // Surface elevation
  surfacePrimary: '#1A1B1E',
  surfaceSecondary: '#242629',
  surfaceTertiary: '#2E3033',
  
  // Strong borders
  border: '#2E3033',
  borderLight: '#3A3D41',
  divider: '#2E3033',
  
  // Bright text hierarchy
  textPrimary: '#F8F9FA',
  textSecondary: '#A0A6AD',
  textTertiary: '#6C757D',
  textInverse: '#0A0A0B',
  
  // Legacy mappings
  surface: '#1A1B1E',
  surfaceElevated: '#242629',
  text: '#F8F9FA',
  tint: '#60B5FF',
  card: '#1A1B1E',
  cardBorder: '#2E3033',
  tabBar: 'rgba(26,27,30,0.95)',
  tabBarBorder: 'rgba(255,255,255,0.08)',
  tabIconDefault: '#6C757D',
  tabIconSelected: '#60B5FF',
};

// Shadows - Cross-platform perfect
export const shadows: Record<string, ShadowStyle> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: light.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: light.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: light.shadow || '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: light.shadow || '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: light.shadow || '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Glassmorphism (Sydney Opera House glass effect)
export const glassmorphism = {
  light: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(12px)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
  },
  dark: {
    backgroundColor: 'rgba(26,27,30,0.65)',
    backdropFilter: 'blur(16px)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
  },
};

// Gradients for LinearGradient
export const gradients = {
  // Kerala ocean → Sydney sky
  primary: ['#007AFF', '#5856D6'] as const,
  // Sydney sunset
  sunset: ['#FF9500', '#FF6B6B'] as const,
  // Cultural gold
  gold: ['#FFD700', '#F4A100'] as const,
  // Night market
  darkGradient: ['#1A1B1E', '#2C2C2E'] as const,
  // Hero overlay
  heroOverlay: ['transparent', 'rgba(0,0,0,0.75)'] as const,
} as const;

// Dynamic color hook
export function useColors(): ColorTheme {
  const scheme = useColorScheme();
  return (scheme === 'dark' ? dark : light) as ColorTheme;
}

// Shadow helper
export function useShadows(): typeof shadows {
  return shadows;
}

// Quick shadow accessor
export const Shadows = shadows;

// Default export (light mode)
const Colors = light as ColorTheme & {
  light: ColorTheme;
  dark: ColorTheme;
  shadows: typeof shadows;
  glassmorphism: typeof glassmorphism;
  gradients: typeof gradients;
};

export default Colors;
