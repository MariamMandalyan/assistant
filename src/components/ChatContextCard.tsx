import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';
import { ru } from '../i18n';

type TicketKind = 'inquiry' | 'complaint';

type Props = {
  departmentName?: string;
  referenceCode?: string;
  ticketKind?: TicketKind;
};

function kindLabel(kind: TicketKind) {
  return kind === 'complaint' ? ru.chat.kindComplaint : ru.chat.kindInquiry;
}

export function ChatContextCard({
  departmentName,
  referenceCode,
  ticketKind = 'inquiry',
}: Props) {
  if (!departmentName && !referenceCode) return null;

  return (
    <View style={styles.card}>
      {departmentName ? (
        <View style={styles.row}>
          <Text style={styles.label}>{ru.chat.contextDepartment}</Text>
          <Text style={styles.value} numberOfLines={2}>
            {departmentName}
          </Text>
        </View>
      ) : null}
      <View style={styles.row}>
        <Text style={styles.label}>{ru.chat.contextType}</Text>
        <View
          style={[
            styles.kindPill,
            ticketKind === 'complaint'
              ? styles.kindPillComplaint
              : styles.kindPillInquiry,
          ]}>
          <Text
            style={[
              styles.kindText,
              ticketKind === 'complaint'
                ? styles.kindTextComplaint
                : styles.kindTextInquiry,
            ]}>
            {kindLabel(ticketKind)}
          </Text>
        </View>
      </View>
      {referenceCode ? (
        <View style={styles.row}>
          <Text style={styles.label}>{ru.chat.contextReference}</Text>
          <Text style={styles.valueMono}>{referenceCode}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  value: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text,
    fontWeight: '600',
  },
  valueMono: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  kindPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  kindText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  kindPillInquiry: {
    backgroundColor: colors.primaryMuted,
  },
  kindTextInquiry: {
    color: colors.primary,
  },
  kindPillComplaint: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
  },
  kindTextComplaint: {
    color: '#FB7185',
  },
});
