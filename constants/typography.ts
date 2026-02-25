import { Platform, ScaledSize, useWindowDimensions } from 'react-native';
import Colors from '@/constants/colors';
import { Spacing } from './Spacing';

/**
 * CulturePassAU Typography System
 * SF Pro (iOS) + Poppins (Android/Web) hybrid
 * Responsive + Dark Mode ready
 */

const BASE_FONT_SCALE = {
  largeTitle: 34,
  title1: 28,
  title2: 22,
  title3: 20,
  headline: 17,
  body: 17,
  callout: 16,
  subheadline: 15,
  footnote: 13,
  caption1: 12,
  caption2: 11,
};

// Platform font families
const systemFont = Platform.select({
  ios: '-apple-system, SF Pro Display, SF Pro Text, SF Pro, SF, system-ui, sans-serif',
  default: 'Poppins_400Regular',
});

const systemFontMedium = Platform.select({
  ios: '-apple-system, SF Pro Display, SF Pro Text, SF Pro, SF, system-ui, sans-serif',
  default: 'Poppins_500Medium',
});

const systemFontSemibold = Platform.select({
  ios: '-apple-system, SF Pro Display, SF Pro Text, SF Pro, SF, system-ui, sans-serif',
  default: 'Poppins_600SemiBold',
});

const systemFontBold = Platform.select({
  ios: '-apple-system, SF Pro Display, SF Pro Text, SF Pro, SF, system-ui, sans-serif',
  default: 'Poppins_700Bold',
});

// Core scales (iOS Human Interface Guidelines + Poppins)
export const Typography = {
  // Hero / Marketing
  hero1: {
    fontFamily: systemFontBold,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.5,
  },
  hero2: {
    fontFamily: systemFontBold,
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -0.4,
  },

  // Titles
  largeTitle: {
    fontFamily: systemFontBold,
    fontSize: BASE_FONT_SCALE.largeTitle,
    lineHeight: 40,
    letterSpacing: 0.4,
  },
  title1: {
    fontFamily: systemFontBold,
    fontSize: BASE_FONT_SCALE.title1,
    lineHeight: 34,
    letterSpacing: 0.4,
  },
  title2: {
    fontFamily: systemFontSemibold,
    fontSize: BASE_FONT_SCALE.title2,
    lineHeight: 28,
    letterSpacing: 0.4,
  },
  title3: {
    fontFamily: systemFontSemibold,
    fontSize: BASE_FONT_SCALE.title3,
    lineHeight: 26,
    letterSpacing: 0.4,
  },

  // Body Text
  headline: {
    fontFamily: systemFontSemibold,
    fontSize: BASE_FONT_SCALE.headline,
    lineHeight: 22,
    letterSpacing: -0.4,
  },
  body: {
    fontFamily: systemFont,
    fontSize: BASE_FONT_SCALE.body,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  callout: {
    fontFamily: systemFontMedium,
    fontSize: BASE_FONT_SCALE.callout,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  subheadline: {
    fontFamily: systemFont,
    fontSize: BASE_FONT_SCALE.subheadline,
    lineHeight: 20,
    letterSpacing: -0.2,
  },

  // UI Text
  footnote: {
    fontFamily: systemFont,
    fontSize: BASE_FONT_SCALE.footnote,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  caption1: {
    fontFamily: systemFontMedium,
    fontSize: BASE_FONT_SCALE.caption1,
    lineHeight: 16,
  },
  caption2: {
    fontFamily: systemFont,
    fontSize: BASE_FONT_SCALE.caption2,
    lineHeight: 14,
    letterSpacing: 0.1,
  },

  // CulturePassAU Custom
  sectionTitle: {
    fontFamily: systemFontSemibold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontFamily: systemFontSemibold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontFamily: systemFont,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  buttonLabel: {
    fontFamily: systemFontSemibold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  badge: {
    fontFamily: systemFontSemibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  micro: {
    fontFamily: systemFont,
    fontSize: 11,
    lineHeight: 14,
  },
} as const;

// Responsive typography hook
export function useTypography(): typeof Typography & {
  scale: (sizeKey: keyof typeof BASE_FONT_SCALE, scaleFactor?: number) => any;
} {
  const dimensions = useWindowDimensions();
  const scaleFactor = Math.min(dimensions.width / 375, dimensions.height / 812, 1.2);

  const scale = (sizeKey: keyof typeof BASE_FONT_SCALE, factor = 1) => ({
    fontSize: Math.min(BASE_FONT_SCALE[sizeKey] * scaleFactor * factor, 48),
  });

  return {
    ...Typography,
    scale,
  };
}

// Pre-styled Text components
export const TextStyles = {
  H1: (props: any) => <Text style={Typography.largeTitle} {...props} />,
  H2: (props: any) => <Text style={Typography.title1} {...props} />,
  H3: (props: any) => <Text style={Typography.title2} {...props} />,
  Section: (props: any) => <Text style={Typography.sectionTitle} {...props} />,
  Body: (props: any) => <Text style={Typography.body} {...props} />,
  Caption: (props: any) => <Text style={Typography.caption1} {...props} />,
};

// Color-aware text styles
export const TextWithColor = {
  primary: {
    color: Colors.primary,
  },
  secondary: {
    color: Colors.textSecondary,
  },
  inverse: {
    color: Colors.textInverse,
  },
};

// Line height multiplier (perfect for Poppins)
export const LineHeight = {
  tight: 1.1,
  normal: 1.4,
  loose: 1.6,
};

// Export utilities
export {
  systemFont,
  systemFontMedium,
  systemFontSemibold,
  systemFontBold,
};
