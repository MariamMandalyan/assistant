import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function WelcomeHero() {
  return (
    <View style={styles.wrap}>
      <View style={[styles.glow, styles.glowPurple]} />
      <View style={[styles.glow, styles.glowBlue]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  glowPurple: {
    width: 180,
    height: 180,
    backgroundColor: colors.primary,
    top: 20,
    left: '18%',
  },
  glowBlue: {
    width: 140,
    height: 140,
    backgroundColor: colors.accentBlue,
    bottom: 10,
    right: '12%',
  },
});
