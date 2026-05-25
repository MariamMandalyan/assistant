import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SelectionCard } from '../components/SelectionCard';
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

type Props = NativeStackScreenProps<MainStackParamList, 'Inquiries'>;

export function InquiriesScreen({ navigation }: Props) {
  const [inquiries, setInquiries] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await complaintsStore.listInquiries();
    setInquiries(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => alert(ru.common.error, ru.inquiries.loadError))
        .finally(() => setLoading(false));
    }, [load]),
  );

  const statusLabel = (status: Complaint['status']) =>
    ru.complaints.status[status] ?? status;

  return (
    <ScreenLayout onBack={() => navigation.goBack()}>
      <View style={styles.header}>
        <ScreenHeader
          title={ru.nav.inquiries}
          subtitle={ru.inquiries.listSubtitle}
        />
      </View>
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          color={colors.text}
          size="large"
        />
      ) : (
        <FlatList
          data={inquiries}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={colors.text}
              onRefresh={async () => {
                setRefreshing(true);
                try {
                  await load();
                } finally {
                  setRefreshing(false);
                }
              }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>{ru.inquiries.empty}</Text>
          }
          renderItem={({ item }) => (
            <SelectionCard
              title={item.subject}
              subtitle={`${item.referenceCode} · ${statusLabel(item.status)}${
                item.departmentName ? ` · ${item.departmentName}` : ''
              }`}
              emoji="💬"
              onPress={() =>
                navigation.navigate('ComplaintDetail', {
                  complaintId: item.id,
                  kind: 'inquiry',
                })
              }
            />
          )}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
  },
  loader: { flex: 1 },
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 48,
    fontSize: fontSize.lg,
  },
});
