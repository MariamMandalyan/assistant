import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../theme/colors';
import { control, radius, spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  /** Auth screens: only placeholder, no label, compact border */
  variant?: 'default' | 'auth';
};

export function Input({
  label,
  error,
  leftIcon,
  variant = 'default',
  style,
  ...rest
}: Props) {
  const isAuth = variant === 'auth';
  const showLabel = !!label;

  return (
    <View style={[styles.wrap, isAuth && styles.wrapAuth]}>
      {showLabel ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          isAuth && styles.fieldAuth,
          error && styles.fieldError,
        ]}>
        {leftIcon ? <View style={styles.iconSlot}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            isAuth && styles.inputAuth,
            !leftIcon && styles.inputNoIcon,
            style,
          ]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  wrapAuth: { marginBottom: spacing.md },
  label: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: control.paddingHorizontal,
    minHeight: control.minHeight,
  },
  fieldAuth: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderColor: colors.borderLight,
    minHeight: 52,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  iconSlot: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.text,
    paddingVertical: control.paddingVertical,
  },
  inputAuth: {
    fontSize: fontSize.body,
    paddingVertical: 14,
  },
  inputNoIcon: {
    paddingLeft: 0,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});
