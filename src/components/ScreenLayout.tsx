import type { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from './BackButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  children: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export function ScreenLayout({
  children,
  onBack,
  showBack = true,
  style,
  contentStyle,
}: Props) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={['top', 'left', 'right']}>
      {showBack && onBack ? (
        <View style={styles.backRow}>
          <BackButton onPress={onBack} />
        </View>
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backRow: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
});
