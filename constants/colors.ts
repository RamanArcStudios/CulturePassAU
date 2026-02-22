import { Platform, PlatformColor } from 'react-native';

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const Colors = {
  primary: '#D4654A',
  primaryLight: '#E0836C',
  primaryDark: '#B84A32',
  primaryGlow: 'rgba(212, 101, 74, 0.10)',
  primarySoft: 'rgba(212, 101, 74, 0.06)',

  secondary: '#16656E',
  secondaryLight: '#2B8A83',
  secondaryDark: '#0F4D54',

  accent: '#C9941A',
  accentLight: '#E8C44A',

  background: '#F8F7F4',
  backgroundSecondary: '#F2F0EB',

  card: '#FFFFFF',
  cardBorder: '#E5E3DE',
  cardShadow: 'rgba(0,0,0,0.06)',

  text: '#1A1A1C',
  textSecondary: '#5C5C60',
  textTertiary: '#98989D',
  textInverse: '#FFFFFF',

  border: '#E5E3DE',
  divider: '#EDEBE6',

  success: '#2EBD59',
  warning: '#F09000',
  error: '#E93B2D',

  overlay: 'rgba(0,0,0,0.4)',
  tabIconDefault: '#8E8E93',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E3DE',

  surface: '#FFFFFF',
  surfaceElevated: '#F2F0EB',
  surfaceSecondary: '#F2F0EB',
  borderLight: '#E5E3DE',

  light: {
    text: '#1A1A1C',
    background: '#F8F7F4',
    tint: '#D4654A',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#D4654A',
    primary: '#D4654A',
    primaryLight: '#E0836C',
    primaryDark: '#B84A32',
    secondary: '#16656E',
    secondaryLight: '#2B8A83',
    accent: '#C9941A',
    accentLight: '#E8C44A',
    surface: '#FFFFFF',
    surfaceElevated: '#F2F0EB',
    card: '#FFFFFF',
    cardBorder: '#E5E3DE',
    border: '#E5E3DE',
    borderLight: '#E5E3DE',
    divider: '#EDEBE6',
    textSecondary: '#5C5C60',
    textTertiary: '#98989D',
    textInverse: '#FFFFFF',
    success: '#2EBD59',
    warning: '#F09000',
    error: '#E93B2D',
    overlay: 'rgba(0,0,0,0.4)',
  },
  dark: {
    text: '#F0F0F5',
    background: '#1A1A1E',
    tint: '#E0836C',
    tabIconDefault: '#5C5C60',
    tabIconSelected: '#E0836C',
  },

  shadow: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 } as const,
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    } satisfies ShadowStyle,
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 } as const,
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 3,
    } satisfies ShadowStyle,
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 } as const,
      shadowOpacity: 0.10,
      shadowRadius: 20,
      elevation: 6,
    } satisfies ShadowStyle,
  },
};

export default Colors;
