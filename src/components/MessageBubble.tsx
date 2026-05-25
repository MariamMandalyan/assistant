import { StyleSheet, Text, View } from 'react-native';
import { ChatContextCard } from './ChatContextCard';
import { ChatSendCard } from './ChatSendCard';
import { ChatMessageImages } from './ChatMessageImages';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontSize, lineHeight } from '../theme/typography';
import { ru } from '../i18n';
import type { ChatMessage } from '../api/types';

type Props = { message: ChatMessage };

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const isStaff = message.role === 'staff';
  const meta = message.metadata;
  const ticketKind = meta?.ticketKind ?? 'inquiry';

  if (meta?.type === 'ticket_created') {
    return (
      <View style={styles.row}>
        <View style={[styles.bubble, styles.bubbleAssistant, styles.cardBubble]}>
          <ChatSendCard
            variant="sent"
            departmentName={meta.departmentName}
            referenceCode={meta.referenceCode}
            ticketKind={ticketKind}
          />
        </View>
      </View>
    );
  }

  if (
    meta?.type === 'proposal' &&
    meta.status === 'confirmed' &&
    !meta.confirmed
  ) {
    return (
      <View style={styles.row}>
        <View style={[styles.bubble, styles.bubbleAssistant, styles.cardBubble]}>
          <ChatSendCard
            variant="proposal"
            departmentName={meta.departmentName}
            ticketKind={ticketKind}
            formulatedSubject={meta.formulatedSubject}
            formulatedDescription={meta.formulatedDescription}
            hint={message.content?.trim() || undefined}
          />
        </View>
      </View>
    );
  }

  if (meta?.type === 'proposal' && meta.status === 'wrong_service') {
    return (
      <View style={styles.row}>
        <View style={[styles.bubble, styles.bubbleAssistant, styles.cardBubble]}>
          <ChatSendCard
            variant="redirect"
            departmentName={meta.departmentName}
            ticketKind={ticketKind}
            hint={message.content?.trim() || ru.chat.wrongServiceHint}
          />
        </View>
      </View>
    );
  }

  const showUserContextCard = isUser && meta?.departmentName;

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View
        style={[
          styles.bubble,
          isUser && styles.bubbleUser,
          isStaff && styles.bubbleStaff,
          !isUser && !isStaff && styles.bubbleAssistant,
        ]}>
        {isStaff ? (
          <Text style={styles.staffBadge}>{ru.chat.staffBadge}</Text>
        ) : null}
        {message.attachments && message.attachments.length > 0 ? (
          <ChatMessageImages
            attachments={message.attachments}
            alignEnd={isUser}
          />
        ) : null}
        {message.content && !showUserContextCard ? (
          <Text
            style={[
              styles.text,
              isUser ? styles.textUser : styles.textOther,
              message.attachments?.length ? styles.textAfterPhotos : null,
            ]}>
            {message.content.replace(/\*\*/g, '')}
          </Text>
        ) : null}
        {showUserContextCard ? (
          <>
            {message.content ? (
              <Text style={[styles.text, styles.textUser, styles.textAfterPhotos]}>
                {message.content.replace(/\*\*/g, '')}
              </Text>
            ) : null}
            <ChatContextCard
              departmentName={meta?.departmentName}
              ticketKind={ticketKind}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 10, alignItems: 'flex-start' },
  rowUser: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '85%',
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardBubble: {
    maxWidth: '92%',
    paddingVertical: spacing.md,
  },
  bubbleUser: {
    backgroundColor: colors.userBubble,
  },
  bubbleAssistant: {
    backgroundColor: colors.assistantBubble,
  },
  bubbleStaff: {
    backgroundColor: colors.staffBubble,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  staffBadge: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  text: { fontSize: fontSize.lg, lineHeight: lineHeight.relaxed },
  textAfterPhotos: { marginTop: spacing.sm },
  textUser: { color: colors.textOnPrimary },
  textOther: { color: colors.text },
});
