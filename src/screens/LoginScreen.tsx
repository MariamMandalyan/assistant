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
import { fontSize } from '../theme/typography';
import { ru } from '../i18n';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { startLogin } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (phone.replace(/\D/g, '').length < 8) {
      alert(ru.common.error, ru.login.phoneRequired);
      return;
    }
    setLoading(true);
    try {
      const devOtp = await startLogin(phone.trim());
      if (devOtp) {
        alert(ru.register.devOtpTitle, ru.register.devOtpBody(devOtp));
      }
      navigation.navigate('Otp');
    } catch (e) {
      alert(ru.common.error, getApiErrorMessage(e, ru.login.failed));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout onBack={() => navigation.goBack()} showLogo={false}>
      <Text style={styles.title}>{ru.welcome.hasAccount}</Text>
      <Input
        variant="auth"
        label={ru.register.phone}
        leftIcon={<AppIcon icon={TelephoneIcon} size={20} />}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder={ru.register.phonePlaceholder}
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
    marginBottom: spacing.xl,
  },
  submitBtn: {
    marginTop: spacing.xl,
  },
});
