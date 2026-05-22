import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { control, radius } from '../theme/spacing';
import { fontSize } from '../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  fullWidth = true,
}: Props) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? colors.buttonPrimaryText : colors.text}
        />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary && styles.labelPrimary,
            isSecondary && styles.labelSecondary,
            isGhost && styles.labelGhost,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: control.paddingVertical + 2,
    paddingHorizontal: control.paddingHorizontalWide,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors.buttonPrimaryBg,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.buttonSecondaryBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.9 },
  label: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelPrimary: { color: colors.buttonPrimaryText },
  labelSecondary: { color: colors.buttonSecondaryText },
  labelGhost: { color: colors.text },
});
