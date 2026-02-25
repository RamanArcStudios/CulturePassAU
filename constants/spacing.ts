import { Dimensions, Platform } from 'react-native';
import Colors from '@/constants/colors';

/**
 * CulturePassAU Design System Tokens
 * Consistent 4-point grid + Sydney-inspired spacing
 * Use these instead of magic numbers for perfect consistency
 */

export const Spacing = {
  // Micro
  xxs: 2,    // Hairline, tight separators
  xs: 4,     // Compact icons, micro-padding
  
  // Compact  
  sm: 8,     // Icon buttons, tight gaps
  md: 12,    // Form fields, card gutters
  
  // Comfortable
  lg: 16,    // Lists, section padding
  xl: 20,    // Page margins, card padding
  xxl: 24,   // Headers, major breaks
  
  // Generous
  xxxl: 32,  // Hero sections, modal padding
  xxxxl: 40, // Landing pages
} as const;

export const Radius = {
  xs: 4,     // Tags, badges
  sm: 8,     // Buttons, inputs
  md: 12,    // Cards, modals
  lg: 16,    // Prominent cards
  xl: 24,    // Hero banners
  full: 9999,// Pills, avatars
} as const;

export const Layout = {
  // Responsive breakpoints
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  
  // Content widths
  mobileContent: 360,
  tabletContent: 480,
  desktopContent: 640,
  
  // Fixed heights
  tabBarHeight: Platform.OS === 'ios' ? 90 : 84,
  statusBarHeight: Platform.OS === 'ios' ? 44 : 0,
  
  // Safe area defaults
  safeTop: 20,
  safeBottom: 32,
  
  // Grid system
  gridGutter: Spacing.lg,
  gridColumns: 12,
} as const;

export const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
  safeArea: {
    top: 44,
    bottom: Platform.OS === 'ios' ? 34 : 20,
  },
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Responsive utilities
export const responsiveWidth = (percentage: number): string => 
  `${percentage}%`;

export const maxWidth = (width: number): any => ({
  maxWidth: width,
  width: '100%',
});

// Touch target minimum (Apple HIG compliant)
export const minTouchTarget = 44;

// Typography scale helpers
export const fontScale = {
  hero: 34,
  h1: 28,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 14,
  micro: 12,
};

// Breakpoint-aware spacing
export const useSpacing = (baseSpacing: keyof typeof Spacing) => {
  const screenWidth = Screen.width;
  const spacing = Spacing[baseSpacing];
  
  if (screenWidth >= Layout.desktop) return spacing * 1.25;
  if (screenWidth >= Layout.tablet) return spacing * 1.125;
  return spacing;
};

// Shadow helper (ensures cross-platform consistency)
export const useShadow = (level: keyof typeof Shadows) => Shadows[level];

// Responsive radius (larger on bigger screens)
export const useRadius = (baseRadius: keyof typeof Radius) => {
  const screenWidth = Screen.width;
  const radius = Radius[baseRadius];
  
  if (screenWidth >= Layout.desktop) return Math.min(radius * 1.1, 32);
  return radius;
};

// Pre-defined card styles
export const Card = {
  container: {
    backgroundColor: Colors.surfacePrimary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.md,
    padding: Spacing.xxl,
  },
  elevated: {
    backgroundColor: Colors.surfacePrimary,
    borderRadius: Radius.lg,
    ...Shadows.lg,
    padding: Spacing.xxl,
  },
};

// Pre-defined button styles
export const Button = {
  primary: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
    ...Shadows.sm,
  },
  secondary: {
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
};

// Pre-defined gap utilities
export const Gap = {
  row: {
    gap: Spacing.md,
  },
  column: {
    gap: Spacing.lg,
  },
  tight: {
    gap: Spacing.xs,
  },
  loose: {
    gap: Spacing.xl,
  },
};

// Export everything for easy import
export * from './Spacing';
export * from './Radius';
export * from './Layout';
export * from './Shadows';
export * from './Screen';
