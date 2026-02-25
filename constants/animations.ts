import { Platform, useColorScheme, Easing } from 'react-native';
import Animated, {
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useEffect, useState, useCallback } from 'react';

/**
 * CulturePassAU Sydney Motion System
 * Kerala-inspired smooth + Sydney energetic
 * HIG + Material 3 motion perfect hybrid
 */

export const Duration = {
  // Micro (50-150ms)
  instant: 100,    // Toggles, checkboxes
  micro: 150,      // Hover states, tooltips
  
  // Fast (200-300ms)
  fast: 250,       // Buttons, chips, small cards
  
  // Standard (300-500ms)
  normal: 350,     // Lists, modals, page transitions
  emphasized: 450, // Hero reveals, major state changes
  
  // Slow (500-800ms)
  slow: 600,       // Full-screen, staggered entrances
  epic: 800,       // Landing page hero animations
  
  // Timing helpers
  stagger: 80,     // List item delays
  pulse: 1200,     // Breathing animations
} as const;

export const SpringConfig = {
  // Snappy (buttons, taps)
  snappy: { 
    damping: 18, 
    stiffness: 250, 
    mass: 0.8 
  } as Animated.SpringConfig,
  
  // Smooth (cards, lists)
  smooth: { 
    damping: 22, 
    stiffness: 140, 
    mass: 1 
  } as Animated.SpringConfig,
  
  // Bouncy (Sydney energy)
  bouncy: { 
    damping: 14, 
    stiffness: 180, 
    mass: 0.7 
  } as Animated.SpringConfig,
  
  // Gentle (Kerala calm)
  gentle: { 
    damping: 28, 
    stiffness: 90, 
    mass: 1.2 
  } as Animated.SpringConfig,
  
  // Floating (Sydney Opera House)
  floating: { 
    damping: 20, 
    stiffness: 110, 
    mass: 1.1 
  } as Animated.SpringConfig,
} as const;

export const EasingConfig = {
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.bezier(0.25, 0.1, 0.25, 1),
  springy: Easing.bezier(0.34, 1.56, 0.64, 1),
  anticipatory: Easing.bezier(0.36, 0, 0.66, -0.56),
} as const;

// Animation utilities
export const animations = {
  fadeIn: (delay = 0) => ({
    entering: Animated.FadeIn.duration(Duration.normal)
      .delay(delay)
      .springify(),
  }),
  
  slideUp: (delay = 0) => ({
    entering: Animated.FadeInUp.duration(Duration.emphasized)
      .delay(delay)
      .springify({ 
        damping: SpringConfig.gentle.damping,
        stiffness: SpringConfig.gentle.stiffness,
      }),
  }),
  
  scaleIn: (delay = 0) => ({
    entering: Animated.withSpring(1, SpringConfig.snappy)
      .delay(delay),
  }),
  
  pulse: () => withRepeat(
    withSequence(
      withSpring(1.05, SpringConfig.bouncy),
      withSpring(1, SpringConfig.snappy),
    ),
    -1,
    false,
  ),
};

// Reduced motion hook
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'web') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduced(mediaQuery.matches);
      
      const handler = () => setReduced(mediaQuery.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    
    // Native: AccessibilityInfo (async, but respects system setting)
    import('react-native').then(({ AccessibilityInfo }) => {
      AccessibilityInfo.announceForAccessibility('Motion settings updated');
      AccessibilityInfo.isReduceMotionEnabled()
        .then(setReduced)
        .catch(() => setReduced(false));
    });
    
    return () => {};
  }, [scheme]);

  return reduced;
}

// Conditional animation helper
export function useAnimation(enabled: boolean = true) {
  const reduced = useReducedMotion();
  
  const animate = useCallback((value: any, config: any) => {
    if (reduced || !enabled) {
      return value;
    }
    return value;
  }, [reduced, enabled]);

  const FadeIn = useCallback((delay = 0) => ({
    entering: Animated.FadeIn.duration(Duration.fast)
      .delay(delay)
      .springify(),
  }), []);

  const SlideUp = useCallback((delay = 0) => ({
    entering: Animated.FadeInUp.duration(Duration.normal)
      .delay(delay)
      .springify(SpringConfig.smooth),
  }), []);

  return {
    animate,
    FadeIn,
    SlideUp,
    reduced,
    Duration,
    SpringConfig,
  };
}

// Pre-configured stagger for lists
export function staggerAnimation(index: number, config: any = SpringConfig.smooth) {
  return {
    entering: Animated.withDelay(
      index * Duration.stagger,
      Animated.withSpring(1, config)
    ),
  };
}

// Export everything
export {
  Duration,
  SpringConfig,
  EasingConfig,
  animations,
  useReducedMotion,
  useAnimation,
  staggerAnimation,
};
