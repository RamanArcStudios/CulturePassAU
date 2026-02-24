/**
 * Consistent spacing scale (4-point grid) and layout constants.
 * Use these tokens instead of raw numbers for maintainable layouts.
 */

export const Spacing = {
  /** 2px — hairline separator padding */
  xxs: 2,
  /** 4px — tight internal padding */
  xs: 4,
  /** 8px — compact gaps, icon padding */
  sm: 8,
  /** 12px — standard inner padding */
  md: 12,
  /** 16px — section padding, card gutters */
  lg: 16,
  /** 20px — page horizontal padding */
  xl: 20,
  /** 24px — section vertical spacing */
  xxl: 24,
  /** 32px — major section breaks */
  xxxl: 32,
} as const;

export const Radius = {
  /** 4px — subtle rounding for tags/chips */
  xs: 4,
  /** 8px — input fields, small cards */
  sm: 8,
  /** 12px — standard cards */
  md: 12,
  /** 16px — prominent cards, icon containers */
  lg: 16,
  /** 24px — banners, large cards */
  xl: 24,
  /** 9999px — fully round (pills, avatars) */
  full: 9999,
} as const;

export const Layout = {
  /** Maximum content width for web responsiveness */
  maxContentWidth: 480,
  /** Wider breakpoint for tablet / desktop */
  wideBreakpoint: 768,
  /** Tab bar approximate height for bottom padding */
  tabBarHeight: 84,
} as const;
