import { StyleSheet, Text, View } from 'react-native';
import { ChatContextCard } from './ChatContextCard';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';
import { ru } from '../i18n';

type TicketKind = 'inquiry' | 'complaint';

type Props = {
  variant: 'proposal' | 'sent' | 'redirect';
  departmentName?: string;
  ticketKind?: TicketKind;
  referenceCode?: string;
  formulatedSubject?: string;
  formulatedDescription?: string;
  hint?: string;
};

export function ChatSendCard({
  variant,
  departmentName,
  ticketKind = 'inquiry',
  referenceCode,
  formulatedSubject,
  formulatedDescription,
  hint,
}: Props) {
  const title =
    variant === 'sent'
      ? ticketKind === 'complaint'
        ? ru.chat.sentComplaintTitle
        : ru.chat.sentInquiryTitle
      : variant === 'redirect'
        ? ru.chat.redirectTitle
        : ticketKind === 'complaint'
          ? ru.chat.proposalComplaintTitle
          : ru.chat.proposalInquiryTitle;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <ChatContextCard
        departmentName={departmentName}
        referenceCode={referenceCode}
        ticketKind={ticketKind}
      />
      {variant === 'proposal' && formulatedSubject ? (
        <>
          <Text style={styles.label}>{ru.chat.formulatedLabel}</Text>
          <Text style={styles.subject}>{formulatedSubject}</Text>
          {formulatedDescription ? (
            <Text style={styles.body}>{formulatedDescription}</Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  subject: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
