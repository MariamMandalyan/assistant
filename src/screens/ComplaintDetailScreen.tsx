import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageAttachments } from '../components/ImageAttachments';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenLayout } from '../components/ScreenLayout';
import { alert } from '../context/AlertModalContext';
import { complaintsStore } from '../store/complaintsStore';
import type { Complaint } from '../types/complaint';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';
import { ru } from '../i18n';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'ComplaintDetail'>;

export function ComplaintDetailScreen({ navigation, route }: Props) {
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await complaintsStore.get(complaintId);
    setComplaint(data);
  }, [complaintId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() =>
          alert(ru.common.error, ru.complaints.detailLoadError),
        )
        .finally(() => setLoading(false));
    }, [load]),
  );

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
        <Text style={styles.missing}>{ru.complaints.notFound}</Text>
      </ScreenLayout>
    );
  }

  const statusLabel =
    ru.complaints.status[complaint.status] ?? complaint.status;

  return (
    <ScreenLayout onBack={() => navigation.goBack()}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
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
          <ImageAttachments images={complaint.images} onChange={() => {}} readonly />
        ) : null}
        <Text style={styles.date}>
          {ru.complaints.createdAt(
            new Date(complaint.createdAt).toLocaleDateString('ru-RU'),
          )}
        </Text>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
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
  date: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
