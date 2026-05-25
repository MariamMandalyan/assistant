import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { control, radius, spacing } from '../theme/spacing';
import { fontSize, lineHeight } from '../theme/typography';
import type { AlertButton } from '../types/alert';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onButtonPress: (button: AlertButton) => void;
};

function isPrimaryButton(button: AlertButton, index: number, buttons: AlertButton[]): boolean {
  if (button.style === 'cancel' || button.style === 'destructive') return false;
  if (button.preferred) return true;
  if (buttons.some((b) => b.preferred)) return false;
  return index === buttons.length - 1;
}

function sortButtonsForDisplay(buttons: AlertButton[]): AlertButton[] {
  if (buttons.length <= 1) return buttons;
  const preferredBtn =
    buttons.find((b) => b.preferred) ??
    [...buttons].reverse().find((b) => b.style !== 'cancel' && b.style !== 'destructive') ??
    buttons[buttons.length - 1];
  return [preferredBtn, ...buttons.filter((b) => b !== preferredBtn)];
}

export function AppModal({
  visible,
  title,
  message,
  buttons,
  onButtonPress,
}: Props) {
  const isError = title.toLowerCase().includes('ошибка') || title === 'Error';
  const displayButtons = sortButtonsForDisplay(buttons);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        const cancel = buttons.find((b) => b.style === 'cancel') ?? buttons[0];
        if (cancel) onButtonPress(cancel);
      }}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={[styles.title, isError && styles.titleError]}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {displayButtons.map((btn, index) => {
              const originalIndex = buttons.indexOf(btn);
              return (
                <AlertModalButton
                  key={`${btn.text}-${originalIndex}`}
                  button={btn}
                  primary={isPrimaryButton(btn, originalIndex, buttons)}
                  onPress={() => onButtonPress(btn)}
                />
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AlertModalButton({
  button,
  primary,
  onPress,
}: {
  button: AlertButton;
  primary: boolean;
  onPress: () => void;
}) {
  const destructive = button.style === 'destructive';
  const cancel = button.style === 'cancel';
  const filled = primary && !destructive;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        filled && styles.btnPrimary,
        cancel && styles.btnSecondary,
        destructive && styles.btnDestructive,
        !filled && !cancel && !destructive && styles.btnSecondary,
        pressed && styles.btnPressed,
      ]}>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={[
          styles.btnText,
          filled && styles.btnTextPrimary,
          destructive && styles.btnTextDestructive,
        ]}>
        {button.text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenWide,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  titleError: {
    color: colors.danger,
  },
  message: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.relaxed,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
    width: '100%',
  },
  btn: {
    width: '100%',
    minHeight: 50,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  btnDestructive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  btnPressed: {
    opacity: 0.88,
  },
  btnText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  btnTextPrimary: {
    color: '#FFFFFF',
  },
  btnTextDestructive: {
    color: colors.danger,
  },
});
