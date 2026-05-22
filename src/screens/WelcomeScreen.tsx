import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { WelcomeHero } from '../components/WelcomeHero';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSize, lineHeight } from '../theme/typography';
import { ru } from '../i18n';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.hero}>
        <WelcomeHero />
        <Text style={styles.title}>{ru.appName}</Text>
        <Text style={styles.subtitle}>{ru.welcome.subtitle}</Text>
      </View>
      <View style={styles.footer}>
        <Button
          label={ru.welcome.createAccount}
          onPress={() => navigation.navigate('Register')}
        />
        <Button
          label={ru.welcome.hasAccount}
          variant="secondary"
          onPress={() => navigation.navigate('Login')}
          style={styles.secondBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenWide,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
    lineHeight: lineHeight.title,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.relaxed + 4,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  footer: {
    padding: spacing.screenWide,
    paddingBottom: spacing.xxl,
  },
  secondBtn: {
    marginTop: spacing.md,
  },
});
