import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  EmailIcon,
  PassportIcon,
  TelephoneIcon,
  UserIcon,
} from '../assets/icons';
import { AppIcon } from '../components/AppIcon';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { alert } from '../context/AlertModalContext';
import { getApiErrorMessage, useAuth } from '../context/AuthContext';
import { apiError } from '../api/logger';
import { ApiError } from '../api/client';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fontSize, lineHeight } from '../theme/typography';
import { ru } from '../i18n';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [passport, setPassport] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!fullName.trim() || phone.replace(/\D/g, '').length < 8) {
      alert(ru.common.error, ru.register.namePhoneRequired);
      return;
    }
    setLoading(true);
    try {
      const devOtp = await register({
        phone: phone.trim(),
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        passportNumber: passport.trim() || undefined,
      });
      if (devOtp) {
        alert(ru.register.devOtpTitle, ru.register.devOtpBody(devOtp));
      }
      navigation.navigate('Otp');
    } catch (e) {
      apiError('RegisterScreen.onSubmit failed', {
        error: e,
        apiError:
          e instanceof ApiError
            ? { status: e.status, url: e.url, body: e.body }
            : undefined,
      });
      alert(
        ru.common.error,
        getApiErrorMessage(e, ru.register.registerFailed),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout onBack={() => navigation.goBack()} showLogo={false}>
      <Text style={styles.title}>{ru.nav.register}</Text>
      <Text style={styles.subtitle}>{ru.register.subtitle}</Text>
      <Input
        variant="auth"
        label={ru.register.fullName}
        leftIcon={<AppIcon icon={UserIcon} size={20} />}
        value={fullName}
        onChangeText={setFullName}
        placeholder={ru.register.fullNamePlaceholder}
      />
      <Input
        variant="auth"
        label={ru.register.phone}
        leftIcon={<AppIcon icon={TelephoneIcon} size={20} />}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder={ru.register.phonePlaceholder}
      />
      <Input
        variant="auth"
        label={ru.register.passport}
        leftIcon={<AppIcon icon={PassportIcon} size={20} />}
        value={passport}
        onChangeText={setPassport}
        placeholder={ru.register.passportPlaceholder}
        autoCapitalize="characters"
      />
      <Input
        variant="auth"
        label={ru.register.emailOptional}
        leftIcon={<AppIcon icon={EmailIcon} size={20} />}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder={ru.register.emailPlaceholder}
      />
      <Button
        label={ru.register.getCode}
        onPress={onSubmit}
        loading={loading}
        style={styles.submitBtn}
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
  },
  submitBtn: {
    marginTop: spacing.xl,
  },
});
