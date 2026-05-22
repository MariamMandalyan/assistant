import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  emoji?: string;
  selected?: boolean;
  onPress: () => void;
};

export function SelectionCard({
  title,
  subtitle,
  icon,
  emoji,
  selected,
  onPress,
}: Props) {
  const leading = icon ?? (emoji ? <Text style={styles.emoji}>{emoji}</Text> : null);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}>
      {leading ? <View style={styles.iconBox}>{leading}</View> : null}
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.borderActive,
    backgroundColor: colors.primaryMuted,
  },
  pressed: { opacity: 0.92 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: { fontSize: fontSize.xl },
  textCol: { flex: 1 },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chevron: {
    fontSize: fontSize.xxl,
    color: colors.textMuted,
    fontWeight: '300',
    marginLeft: spacing.sm,
  },
});
