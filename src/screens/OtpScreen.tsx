import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TelephoneIcon } from '../assets/icons';
import { AppIcon } from '../components/AppIcon';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { alert } from '../context/AlertModalContext';
import { getApiErrorMessage, useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSize, lineHeight } from '../theme/typography';
import { ru } from '../i18n';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

export function OtpScreen({ navigation }: Props) {
  const { pendingPhone, verifyOtp, resendOtp, cancelOtpFlow } = useAuth();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    void cancelOtpFlow();
  };
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    if (code.length < 4) return;
    setLoading(true);
    try {
      await verifyOtp(code);
    } catch (e) {
      alert(ru.common.error, getApiErrorMessage(e, ru.otp.invalid));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      const devOtp = await resendOtp();
      if (devOtp) {
        alert(ru.register.devOtpTitle, ru.register.devOtpBody(devOtp));
      } else {
        alert(ru.common.ok, ru.otp.resent);
      }
    } catch (e) {
      alert(ru.common.error, getApiErrorMessage(e, ru.otp.resendFailed));
    }
  };

  return (
    <AuthScreenLayout onBack={handleBack} showLogo={false}>
      <Text style={styles.title}>{ru.nav.otp}</Text>
      <Text style={styles.subtitle}>
        {ru.otp.sentTo(pendingPhone ?? ru.otp.sentToDefault)}
      </Text>
      <Input
        variant="auth"
        label={ru.otp.codeLabel}
        leftIcon={<AppIcon icon={TelephoneIcon} size={20} />}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        placeholder={ru.otp.codePlaceholder}
      />
      <Button label={ru.otp.confirm} onPress={onVerify} loading={loading} />
      <Button
        label={ru.otp.resend}
        variant="ghost"
        onPress={onResend}
        style={styles.resend}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.relaxed,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'left',
  },
  resend: {
    marginTop: spacing.md,
  },
});
