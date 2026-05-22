import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { MicIcon } from '../assets/icons';
import { AppIcon } from './AppIcon';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
type Props = {
  recording: boolean;
  busy: boolean;
  disabled?: boolean;
  size: number;
  onPress: () => void;
};

export function ChatVoiceButton({
  recording,
  busy,
  disabled,
  size,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.btn,
        { width: size, height: size },
        recording && styles.btnRecording,
        (disabled || busy) && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      {busy ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <AppIcon
          icon={MicIcon}
          size={22}
          color={recording ? colors.danger : colors.text}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  btnRecording: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
});
