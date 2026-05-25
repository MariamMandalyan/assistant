import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UserIcon } from '../assets/icons';
import { AppIcon } from '../components/AppIcon';
import { SelectionCard } from '../components/SelectionCard';
import { ScreenLayout } from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';
import { ru } from '../i18n';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { citizen } = useAuth();
  const firstName = citizen?.fullName?.split(' ')[0] ?? ru.home.greetingDefault;

  return (
    <ScreenLayout showBack={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>{ru.home.greeting(firstName)}</Text>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.status}>
            {citizen?.status === 'verified'
              ? ru.home.verified
              : ru.home.completeProfile}
          </Text>
        </View>
        <SelectionCard
          emoji="💬"
          title={ru.home.assistant}
          subtitle={ru.home.assistantSub}
          onPress={() => navigation.navigate('Chat')}
        />
        <SelectionCard
          emoji="📋"
          title={ru.home.inquiries}
          subtitle={ru.home.inquiriesSub}
          onPress={() => navigation.navigate('Inquiries')}
        />
        <SelectionCard
          emoji="📷"
          title={ru.home.newComplaint}
          subtitle={ru.home.newComplaintSub}
          onPress={() => navigation.navigate('CreateComplaint')}
        />
        <SelectionCard
          emoji="📁"
          title={ru.home.complaints}
          subtitle={ru.home.complaintsSub}
          onPress={() => navigation.navigate('Complaints')}
        />
        <SelectionCard
          icon={<AppIcon icon={UserIcon} size={22} />}
          title={ru.home.profile}
          subtitle={ru.home.profileSub}
          onPress={() => navigation.navigate('Profile')}
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
  greeting: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
    marginBottom: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginBottom: spacing.xl,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  status: { fontSize: fontSize.base, color: colors.primary, fontWeight: '600' },
});
