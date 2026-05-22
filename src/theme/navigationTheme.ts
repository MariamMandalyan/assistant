import { DarkTheme } from '@react-navigation/native';
import { colors } from './colors';

export const appNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.surfaceBorder,
    notification: colors.primary,
  },
};
