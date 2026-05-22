import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
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

export function AppModal({
  visible,
  title,
  message,
  buttons,
  onButtonPress,
}: Props) {
  const isError = title.toLowerCase().includes('ошибка') || title === 'Error';

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
          <View
            style={[
              styles.actions,
              buttons.length > 1 && styles.actionsRow,
            ]}>
            {buttons.map((btn, index) => (
              <AlertModalButton
                key={`${btn.text}-${index}`}
                button={btn}
                primary={
                  buttons.length === 1 ||
                  index === buttons.length - 1
                }
                row={buttons.length > 1}
                onPress={() => onButtonPress(btn)}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AlertModalButton({
  button,
  primary,
  row,
  onPress,
}: {
  button: AlertButton;
  primary: boolean;
  row: boolean;
  onPress: () => void;
}) {
  const destructive = button.style === 'destructive';
  const cancel = button.style === 'cancel';
  const usePrimary = primary && !destructive && !cancel;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        row && styles.btnRow,
        usePrimary && styles.btnPrimary,
        cancel && styles.btnSecondary,
        destructive && styles.btnDestructive,
        !usePrimary && !cancel && !destructive && styles.btnSecondary,
        pressed && styles.btnPressed,
      ]}>
      <Text
        style={[
          styles.btnText,
          usePrimary && styles.btnTextPrimary,
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
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  btn: {
    minHeight: control.minHeight,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  btnRow: {
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: colors.buttonPrimaryBg,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnDestructive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  btnTextPrimary: {
    color: colors.buttonPrimaryText,
  },
  btnTextDestructive: {
    color: colors.danger,
  },
});
