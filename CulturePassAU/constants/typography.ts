import { Platform } from 'react-native';

const systemFont = Platform.select({
  ios: 'System',
  default: 'Poppins_400Regular',
});

const systemFontMedium = Platform.select({
  ios: 'System',
  default: 'Poppins_500Medium',
});

const systemFontSemibold = Platform.select({
  ios: 'System',
  default: 'Poppins_600SemiBold',
});

const systemFontBold = Platform.select({
  ios: 'System',
  default: 'Poppins_700Bold',
});

export const Typography = {
  largeTitle: {
    fontFamily: systemFontBold,
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
  },
  title1: {
    fontFamily: systemFontBold,
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
  },
  title2: {
    fontFamily: systemFontBold,
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
  },
  title3: {
    fontFamily: systemFontSemibold,
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
  },
  headline: {
    fontFamily: systemFontSemibold,
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  body: {
    fontFamily: systemFont,
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  callout: {
    fontFamily: systemFont,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  subheadline: {
    fontFamily: systemFont,
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontFamily: systemFont,
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  caption1: {
    fontFamily: systemFont,
    fontSize: 12,
    fontWeight: '400' as const,
  },
  caption2: {
    fontFamily: systemFont,
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
  },
  hero: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
  },
  section: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
  },
  small: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
};
