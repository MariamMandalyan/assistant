import { StyleSheet, Text, View } from 'react-native';
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
        {message.content ? (
          <Text
            style={[
              styles.text,
              isUser ? styles.textUser : styles.textOther,
              message.attachments?.length ? styles.textAfterPhotos : null,
            ]}>
            {message.content.replace(/\*\*/g, '')}
          </Text>
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
