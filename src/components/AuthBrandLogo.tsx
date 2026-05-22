import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';
import { ru } from '../i18n';

export function AuthBrandLogo() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.logo}>{ru.appName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  logo: {
    fontSize: fontSize.hero + 4,
    fontWeight: '300',
    fontStyle: 'italic',
    color: colors.text,
    letterSpacing: 1,
  },
});
