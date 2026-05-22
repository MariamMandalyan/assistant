import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { BackIcon } from '../assets/icons';
import { colors } from '../theme/colors';
import { AppIcon } from './AppIcon';

type Props = {
  onPress: () => void;
  style?: ViewStyle;
};

export function BackButton({ onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [
        styles.btn,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Назад">
      <AppIcon icon={BackIcon} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backButtonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
});
