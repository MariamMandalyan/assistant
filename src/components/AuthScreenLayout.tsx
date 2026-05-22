import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthBrandLogo } from './AuthBrandLogo';
import { BackButton } from './BackButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  children: ReactNode;
  onBack?: () => void;
  showLogo?: boolean;
  footer?: ReactNode;
};

export function AuthScreenLayout({
  children,
  onBack,
  showLogo = true,
  footer,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      {onBack ? (
        <View style={styles.backRow}>
          <BackButton onPress={onBack} />
        </View>
      ) : null}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {showLogo ? <AuthBrandLogo /> : null}
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  backRow: {
    paddingHorizontal: spacing.screenWide,
    paddingTop: spacing.sm,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenWide,
    paddingBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.screenWide,
    paddingBottom: spacing.xxl,
  },
});
