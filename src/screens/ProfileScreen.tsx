import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PassportIcon } from '../assets/icons';
import { AppIcon } from '../components/AppIcon';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenLayout } from '../components/ScreenLayout';
import { alert } from '../context/AlertModalContext';
import { getApiErrorMessage, useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';
import { ru } from '../i18n';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { citizen, updatePassport, logout } = useAuth();
  const [passport, setPassport] = useState(citizen?.passportNumber ?? '');
  const [loading, setLoading] = useState(false);

  const savePassport = async () => {
    if (passport.length < 5) return;
    setLoading(true);
    try {
      await updatePassport(passport);
      alert(ru.profile.savedTitle, ru.profile.savedBody);
    } catch (e) {
      alert(
        ru.common.error,
        getApiErrorMessage(e, ru.profile.updateFailed),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout onBack={() => navigation.goBack()}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ScreenHeader title={ru.nav.profile} />
        <View style={styles.card}>
          <Text style={styles.name}>{citizen?.fullName}</Text>
          <Text style={styles.line}>{citizen?.phone}</Text>
          <Text style={styles.line}>{citizen?.email ?? '—'}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{ru.profile.status}</Text>
            <Text style={styles.statusValue}>
              {citizen?.status
                ? (ru.profile.statusLabels as Record<string, string>)[
                    citizen.status
                  ] ?? citizen.status
                : '—'}
            </Text>
          </View>
          {citizen?.passportNumber ? (
            <Text style={styles.line}>{citizen.passportNumber}</Text>
          ) : null}
        </View>
        <Text style={styles.section}>{ru.profile.identitySection}</Text>
        <Input
          label={ru.profile.passportNumber}
          leftIcon={<AppIcon icon={PassportIcon} size={20} />}
          value={passport}
          onChangeText={setPassport}
          placeholder={ru.profile.passportPlaceholder}
          autoCapitalize="characters"
        />
        <Button
          label={ru.profile.submitPassport}
          onPress={savePassport}
          loading={loading}
        />
        <Button
          label={ru.profile.logout}
          variant="secondary"
          onPress={() => logout()}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  line: { fontSize: fontSize.lg, color: colors.textSecondary, marginTop: spacing.sm },
  statusRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  statusLabel: { color: colors.textSecondary, fontSize: fontSize.base },
  statusValue: { color: colors.primary, fontWeight: '600', fontSize: fontSize.base },
  section: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
