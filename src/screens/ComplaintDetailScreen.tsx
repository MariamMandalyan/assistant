import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { ImageAttachments } from '../components/ImageAttachments';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenLayout } from '../components/ScreenLayout';
import { alert } from '../context/AlertModalContext';
import { complaintsStore } from '../store/complaintsStore';
import type { Complaint, ComplaintStatus, TicketMessage } from '../types/complaint';
import { useTicketSocket } from '../hooks/useTicketSocket';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';
import { ru } from '../i18n';
import { getApiErrorMessage } from '../api/client';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'ComplaintDetail'>;

const CLOSED_STATUSES = new Set(['resolved', 'closed']);

function formatMessageTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const isStaff = message.authorType === 'staff';
  const label = isStaff
    ? (message.authorName ?? ru.ticketDetail.staff)
    : ru.ticketDetail.you;

  return (
    <View style={[styles.row, isStaff ? styles.rowStaff : styles.rowCitizen]}>
      <View
        style={[
          styles.bubble,
          isStaff ? styles.bubbleStaff : styles.bubbleCitizen,
        ]}>
        <Text
          style={[
            styles.bubbleMeta,
            isStaff ? styles.metaStaff : styles.metaCitizen,
          ]}>
          {label} · {formatMessageTime(message.createdAt)}
        </Text>
        <Text
          style={[
            styles.bubbleText,
            isStaff ? styles.bubbleTextStaff : styles.bubbleTextCitizen,
          ]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export function ComplaintDetailScreen({ navigation, route }: Props) {
  const { complaintId, kind = 'complaint' } = route.params;
  const copy = kind === 'inquiry' ? ru.inquiries : ru.complaints;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');

  const load = useCallback(async () => {
    const data = await complaintsStore.get(complaintId);
    setComplaint(data);
    setMessages(data?.messages ?? []);
  }, [complaintId]);

  const { sending, sendMessage } = useTicketSocket({
    ticketId: complaintId,
    enabled: !loading && !!complaint,
    onNewMessage: (msg) => {
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
    },
    onTicketUpdated: (payload) => {
      setComplaint((c) =>
        c ? { ...c, status: payload.status as ComplaintStatus } : c,
      );
    },
  });

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => alert(ru.common.error, copy.detailLoadError))
        .finally(() => setLoading(false));
    }, [load, copy.detailLoadError]),
  );

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || sending) return;
    try {
      const msg = await sendMessage(text);
      if (msg) {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
        );
      }
      setReply('');
    } catch (e) {
      alert(ru.common.error, getApiErrorMessage(e, ru.ticketDetail.replyError));
    }
  };

  if (loading) {
    return (
      <ScreenLayout onBack={() => navigation.goBack()}>
        <ActivityIndicator
          style={styles.loader}
          color={colors.text}
          size="large"
        />
      </ScreenLayout>
    );
  }

  if (!complaint) {
    return (
      <ScreenLayout onBack={() => navigation.goBack()}>
        <Text style={styles.missing}>{copy.notFound}</Text>
      </ScreenLayout>
    );
  }

  const statusLabel =
    ru.complaints.status[complaint.status] ?? complaint.status;
  const threadMessages = messages;
  const canReply = !CLOSED_STATUSES.has(complaint.status);

  return (
    <ScreenLayout onBack={() => navigation.goBack()}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <ScreenHeader title={complaint.subject} />
          <View style={styles.metaRow}>
            <Text style={styles.ref}>{complaint.referenceCode}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
          {complaint.departmentName ? (
            <Text style={styles.dept}>
              {ru.chat.serviceLabel}: {complaint.departmentName}
            </Text>
          ) : null}
          <Text style={styles.bodyLabel}>{ru.complaints.description}</Text>
          <Text style={styles.body}>{complaint.description}</Text>
          {complaint.images.length > 0 ? (
            <ImageAttachments
              images={complaint.images}
              onChange={() => {}}
              readonly
            />
          ) : null}

          <Text style={styles.sectionTitle}>{ru.ticketDetail.conversation}</Text>
          <View style={styles.thread}>
            {threadMessages.length === 0 ? (
              <Text style={styles.noMessages}>{ru.ticketDetail.noRepliesYet}</Text>
            ) : (
              threadMessages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))
            )}
          </View>

          <Text style={styles.date}>
            {copy.createdAt(
              new Date(complaint.createdAt).toLocaleDateString('ru-RU'),
            )}
          </Text>

          {!canReply ? (
            <Text style={styles.closedBanner}>{ru.ticketDetail.closedBanner}</Text>
          ) : null}
        </ScrollView>

        {canReply ? (
          <View style={styles.replyBar}>
            <TextInput
              style={styles.replyInput}
              value={reply}
              onChangeText={setReply}
              placeholder={ru.ticketDetail.replyPlaceholder}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={2000}
              editable={!sending}
            />
            <Button
              label={ru.ticketDetail.sendReply}
              onPress={sendReply}
              disabled={!reply.trim() || sending}
              loading={sending}
              style={styles.replyBtn}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.lg,
  },
  loader: { flex: 1 },
  missing: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 48,
    fontSize: fontSize.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  ref: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  statusPill: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  statusText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  dept: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bodyLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  thread: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  noMessages: {
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
  },
  rowStaff: {
    justifyContent: 'flex-start',
  },
  rowCitizen: {
    justifyContent: 'flex-end',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    maxWidth: '82%',
  },
  bubbleStaff: {
    backgroundColor: colors.assistantBubble,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleCitizen: {
    backgroundColor: colors.userBubble,
    borderTopRightRadius: 4,
  },
  bubbleMeta: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  metaStaff: {
    color: colors.textSecondary,
  },
  metaCitizen: {
    color: 'rgba(255, 255, 255, 0.72)',
  },
  bubbleText: {
    fontSize: fontSize.lg,
    lineHeight: 22,
  },
  bubbleTextStaff: {
    color: colors.text,
  },
  bubbleTextCitizen: {
    color: '#FFFFFF',
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  closedBanner: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.assistantBubble,
    lineHeight: 22,
  },
  replyBar: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  replyInput: {
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceHover,
    color: colors.text,
    fontSize: fontSize.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
  },
  replyBtn: { marginTop: spacing.xs },
});
