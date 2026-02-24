import { Platform } from 'react-native';

/**
 * Animation timing and easing constants for consistent motion design.
 * Follows Apple HIG and Material Design motion principles.
 */

/** Duration constants (milliseconds) */
export const Duration = {
  /** Micro-interactions: toggles, checkboxes, small state changes */
  instant: 100,
  /** Quick transitions: chips, buttons, small reveals */
  fast: 200,
  /** Standard transitions: cards, modals, page elements */
  normal: 300,
  /** Emphasized transitions: full-screen overlays, major state changes */
  slow: 500,
  /** Staggered list item entrance delay increment */
  stagger: 60,
} as const;

/** Spring config presets for react-native-reanimated */
export const SpringConfig = {
  /** Snappy response for buttons and small interactions */
  snappy: { damping: 15, stiffness: 200, mass: 0.8 },
  /** Smooth, natural-feeling transitions */
  smooth: { damping: 20, stiffness: 120, mass: 1 },
  /** Bouncy entrance animations for cards */
  bouncy: { damping: 12, stiffness: 150, mass: 0.6 },
  /** Gentle settling for large elements */
  gentle: { damping: 25, stiffness: 80, mass: 1.2 },
} as const;

/** Reduced motion flag — skip animations where the platform requests it */
export const prefersReducedMotion = Platform.OS === 'web';
