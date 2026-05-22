export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
  /** Horizontal inset for screen content (scroll areas, headers) */
  screen: 14,
  screenWide: 24,
} as const;

export const radius = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 30,
} as const;

/** Shared padding / height for Input and Button */
export const control = {
  minHeight: 44,
  paddingVertical: 10,
  paddingHorizontal: 14,
  paddingHorizontalWide: 22,
} as const;
