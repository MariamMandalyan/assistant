import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { AddImageIcon, SendIcon } from '../assets/icons';
import { AppIcon } from '../components/AppIcon';
import { ChatVoiceButton } from '../components/ChatVoiceButton';
import { citizenApi } from '../api/citizenApi';
import type { ChatMessage, ChatProposal, Department } from '../api/types';
import type { ComplaintImage } from '../types/complaint';
import { ImageAttachments } from '../components/ImageAttachments';
import { MessageBubble } from '../components/MessageBubble';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenLayout } from '../components/ScreenLayout';
import { alert } from '../context/AlertModalContext';
import { getApiErrorMessage } from '../context/AuthContext';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { colors } from '../theme/colors';
import { control, radius, spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';
import { ru } from '../i18n';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Chat'>;

function findPendingProposal(messages: ChatMessage[]): ChatProposal | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const meta = m.metadata;
    if (
      m.role === 'assistant' &&
      meta?.type === 'proposal' &&
      meta.status === 'confirmed' &&
      !meta.confirmed
    ) {
      return {
        status: 'confirmed',
        canConfirm: true,
        formulatedSubject: meta.formulatedSubject ?? '',
        formulatedDescription: meta.formulatedDescription ?? '',
        departmentId: meta.departmentId ?? '',
        departmentName: meta.departmentName ?? '',
        suggestedDepartmentCode: meta.suggestedDepartmentCode ?? null,
        proposalMessageId: m.id,
      };
    }
  }
  return null;
}

export function ChatScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [pendingProposal, setPendingProposal] = useState<ChatProposal | null>(
    null,
  );
  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<ComplaintImage[]>([]);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { recording, start, stop, cancel } = useVoiceRecorder();
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  const showSend = input.trim().length > 0 && !recording;

  const selectedDept = useMemo(
    () => departments.find((d) => d.id === selectedDeptId) ?? null,
    [departments, selectedDeptId],
  );

  const load = useCallback(async () => {
    try {
      const [chatData, depts] = await Promise.all([
        citizenApi.chatMessages(),
        citizenApi.departments(),
      ]);
      setMessages(chatData.messages);
      setDepartments(depts);
      setPendingProposal(findPendingProposal(chatData.messages));
      if (depts.length === 1) {
        setSelectedDeptId((prev) => prev ?? depts[0].id);
      }
    } catch (e) {
      alert(ru.common.error, getApiErrorMessage(e, ru.chat.loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sendMessage = async (rawText: string, fromVoice = false) => {
    let text = rawText.trim();
    const imagesToSend = [...pendingImages];
    if (!text && imagesToSend.length === 0) return;
    if (sending || confirming) return;
    if (!selectedDeptId) {
      alert(ru.common.error, ru.chat.selectService);
      return;
    }
    if (!text && imagesToSend.length > 0) {
      text = ru.chat.defaultTextWithPhotos;
    }
    if (text.length < 15) {
      alert(ru.common.error, ru.chat.minLength);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticUser: ChatMessage = {
      id: tempId,
      role: 'user',
      content: fromVoice ? `${ru.chat.voiceSentPrefix}${text}` : text,
      metadata: {
        departmentId: selectedDeptId,
        departmentName: selectedDept?.name,
        source: fromVoice ? 'voice' : 'text',
      },
      attachments: imagesToSend.map((img) => ({
        id: img.id,
        fileName: img.fileName ?? 'photo.jpg',
        mimeType: null,
        uri: img.uri,
      })),
      createdAt: new Date().toISOString(),
    };

    if (!fromVoice) {
      setInput('');
      setPendingImages([]);
    }
    setSending(true);
    setPendingProposal(null);
    setMessages((prev) => [...prev, optimisticUser]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const data = await citizenApi.sendChat(
        selectedDeptId,
        text,
        fromVoice ? [] : imagesToSend,
      );
      setMessages((prev) => {
        const rest = prev.filter((m) => m.id !== tempId);
        return [...rest, data.userMessage, data.assistantMessage];
      });
      if (data.proposal.canConfirm) {
        setPendingProposal(data.proposal);
      } else if (data.proposal.suggestedDepartmentCode) {
        const suggested = departments.find(
          (d) => d.code === data.proposal.suggestedDepartmentCode,
        );
        if (suggested) setSelectedDeptId(suggested.id);
      }
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert(ru.common.error, getApiErrorMessage(e, ru.chat.sendError));
      if (!fromVoice) {
        setInput(rawText.trim());
        setPendingImages(imagesToSend);
      }
    } finally {
      setSending(false);
    }
  };

  const send = () => sendMessage(input);

  const pickChatImages = useCallback(() => {
    if (pendingImages.length >= 3) {
      alert(ru.common.error, ru.chat.maxPhotos(3));
      return;
    }
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 3 - pendingImages.length,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel || response.errorMessage) return;
        const picked = (response.assets ?? [])
          .filter((a) => a.uri)
          .map((a, i) => ({
            id: a.fileName ?? `img-${Date.now()}-${i}`,
            uri: a.uri ?? '',
            fileName: a.fileName ?? undefined,
          }));
        if (picked.length === 0) return;
        setPendingImages((prev) => [...prev, ...picked].slice(0, 3));
      },
    );
  }, [pendingImages.length]);

  const toggleVoice = async () => {
    if (sending || confirming || pendingProposal) return;
    if (!selectedDeptId) {
      alert(ru.common.error, ru.chat.selectService);
      return;
    }
    if (!recording) {
      await start();
      return;
    }
    const text = await stop();
    if (!text) {
      alert(ru.common.error, ru.chat.voiceTranscribeError);
      return;
    }
    await sendMessage(text, true);
  };

  const confirmProposal = async () => {
    if (!pendingProposal || confirming) return;
    setConfirming(true);
    try {
      const data = await citizenApi.confirmChat(
        pendingProposal.proposalMessageId,
      );
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === pendingProposal.proposalMessageId
            ? {
              ...m,
              metadata: { ...m.metadata, confirmed: true },
            }
            : m,
        );
        return [...updated, data.assistantMessage];
      });
      setPendingProposal(null);
      alert(
        ru.chat.sentToService,
        `№ ${data.ticket.referenceCode ?? ''} — ${data.ticket.department?.name ?? pendingProposal.departmentName}`,
        [
          { text: ru.common.ok },
          {
            text: ru.nav.complaints,
            onPress: () => navigation.navigate('Complaints'),
          },
        ],
      );
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      alert(ru.common.error, getApiErrorMessage(e, ru.chat.confirmError));
    } finally {
      setConfirming(false);
    }
  };

  const cancelProposal = () => {
    setPendingProposal(null);
    setInput('');
  };

  return (
    <ScreenLayout onBack={() => navigation.goBack()} contentStyle={styles.flex}>
      <View style={styles.headerPad}>
        <ScreenHeader title={ru.nav.chat} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}>
        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            color={colors.primary}
            size="large"
          />
        ) : (
          <>
            <View style={styles.serviceBlock}>
              <Text style={styles.serviceLabel}>{ru.chat.selectService}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.serviceScroll}>
                {departments.map((d) => (
                  <Pressable
                    key={d.id}
                    onPress={() => setSelectedDeptId(d.id)}
                    style={[
                      styles.serviceChip,
                      selectedDeptId === d.id && styles.serviceChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.serviceChipText,
                        selectedDeptId === d.id && styles.serviceChipTextActive,
                      ]}
                      numberOfLines={1}>
                      {d.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.serviceHint}>{ru.chat.selectServiceHint}</Text>
            </View>

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => <MessageBubble message={item} />}
              onContentSizeChange={() =>
                listRef.current?.scrollToEnd({ animated: false })
              }
            />

            {pendingProposal?.canConfirm ? (
              <View style={styles.proposalCard}>
                <Text style={styles.proposalTitle}>{ru.chat.proposalTitle}</Text>
                <Text style={styles.proposalMeta}>
                  {ru.chat.serviceLabel}: {pendingProposal.departmentName}
                </Text>
                <Text style={styles.proposalLabel}>
                  {ru.chat.formulatedLabel}
                </Text>
                <Text style={styles.proposalSubject}>
                  {pendingProposal.formulatedSubject}
                </Text>
                <Text style={styles.proposalBody}>
                  {pendingProposal.formulatedDescription}
                </Text>
                <View style={styles.proposalActions}>
                  <Pressable
                    onPress={cancelProposal}
                    style={styles.proposalBtnSecondary}
                    disabled={confirming}>
                    <Text style={styles.proposalBtnSecondaryText}>
                      {ru.chat.confirmCancel}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={confirmProposal}
                    style={[
                      styles.proposalBtnPrimary,
                      confirming && styles.sendDisabled,
                    ]}
                    disabled={confirming}>
                    {confirming ? (
                      <ActivityIndicator color={colors.buttonPrimaryText} />
                    ) : (
                      <Text style={styles.proposalBtnPrimaryText}>
                        {ru.chat.confirmSend}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : null}
          </>
        )}
        {recording ? (
          <View style={styles.voiceBanner}>
            <Text style={styles.voiceBannerText}>{ru.chat.voiceTapStop}</Text>
            {recording ? (
              <Pressable onPress={() => void cancel()}>
                <Text style={styles.voiceCancel}>{ru.common.later}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {pendingImages.length > 0 && !pendingProposal ? (
          <View style={styles.pendingPhotos}>
            <ImageAttachments
              variant="chat"
              maxImages={3}
              compact
              images={pendingImages}
              onChange={setPendingImages}
            />
          </View>
        ) : null}
        <View style={styles.composer}>
          {!pendingProposal ? (
            <Pressable
              onPress={pickChatImages}
              disabled={sending || recording || confirming}
              style={({ pressed }) => [
                styles.sideBtn,
                (sending || recording || confirming) && styles.sendDisabled,
                pressed && styles.sideBtnPressed,
              ]}>
              <AddImageIcon />
            </Pressable>
          ) : null}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={
                selectedDept
                  ? ru.chat.placeholder
                  : ru.chat.placeholderNoService
              }
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={2000}
              editable={
                !sending &&
                !recording &&
                !confirming &&
                !pendingProposal
              }
            />
          </View>
          {!pendingProposal ? (
            showSend ? (
              <Pressable
                onPress={send}
                disabled={sending || confirming}
                style={({ pressed }) => [
                  styles.sideBtn,
                  (sending || confirming) && styles.sendDisabled,
                  pressed && styles.sideBtnPressed,
                ]}>
                {sending ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <AppIcon icon={SendIcon} size={22} color={colors.text} />
                )}
              </Pressable>
            ) : (
              <ChatVoiceButton
                recording={recording}
                busy={false}
                disabled={sending || confirming}
                size={control.minHeight}
                onPress={toggleVoice}
              />
            )
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.screen },
  loader: { flex: 1 },
  serviceBlock: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  serviceLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  serviceScroll: { gap: spacing.xs, paddingBottom: spacing.xs },
  serviceChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 200,
  },
  serviceChipActive: {
    borderColor: colors.borderActive,
    backgroundColor: colors.primaryMuted,
  },
  serviceChipText: { fontSize: fontSize.base, color: colors.textSecondary },
  serviceChipTextActive: { color: colors.primary, fontWeight: '600' },
  serviceHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, flexGrow: 1 },
  proposalCard: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderActive,
  },
  proposalTitle: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  proposalMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  proposalLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 4,
  },
  proposalSubject: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  proposalBody: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  proposalActions: { flexDirection: 'row', gap: spacing.md },
  proposalBtnSecondary: {
    flex: 1,
    minHeight: control.minHeight,
    paddingVertical: spacing.sm,
    paddingHorizontal: control.paddingHorizontalWide,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proposalBtnSecondaryText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: fontSize.base,
    textAlign: 'center',
  },
  proposalBtnPrimary: {
    flex: 1,
    minHeight: control.minHeight,
    paddingVertical: spacing.sm,
    paddingHorizontal: control.paddingHorizontalWide,
    borderRadius: radius.md,
    backgroundColor: colors.buttonPrimaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proposalBtnPrimaryText: {
    color: colors.buttonPrimaryText,
    fontWeight: '700',
    fontSize: fontSize.base,
    textAlign: 'center',
  },
  voiceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryMuted,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  voiceBannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  voiceCancel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  pendingPhotos: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    paddingHorizontal: spacing.screen,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  sideBtn: {
    width: control.minHeight,
    height: control.minHeight,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sideBtnPressed: { opacity: 0.85 },
  inputWrap: {
    flex: 1,
    minWidth: 0,
    minHeight: control.minHeight,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: control.paddingHorizontal,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
  },
  input: {
    fontSize: fontSize.lg,
    color: colors.text,
    paddingVertical: spacing.sm,
    lineHeight: 20,
    maxHeight: 120 - spacing.sm * 2,
  },
  sendDisabled: { opacity: 0.5 },
});
