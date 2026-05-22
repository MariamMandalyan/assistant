import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { citizenApi } from '../api/citizenApi';
import type { Department } from '../api/types';
import { Button } from '../components/Button';
import { ImageAttachments } from '../components/ImageAttachments';
import { Input } from '../components/Input';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenLayout } from '../components/ScreenLayout';
import { alert } from '../context/AlertModalContext';
import { getApiErrorMessage } from '../context/AuthContext';
import { complaintsStore } from '../store/complaintsStore';
import type { ComplaintImage } from '../types/complaint';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';
import { ru } from '../i18n';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateComplaint'>;

export function CreateComplaintScreen({ navigation }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ComplaintImage[]>([]);
  const [departmentId, setDepartmentId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    citizenApi.departments().then(setDepartments).catch(() => {});
  }, []);

  const submit = async () => {
    if (subject.length < 3 || description.length < 10) {
      alert(ru.common.error, ru.complaints.validation);
      return;
    }
    setLoading(true);
    try {
      const created = await complaintsStore.create({
        subject,
        description,
        departmentId,
        images,
      });
      alert(
        ru.complaints.successTitle,
        ru.complaints.successBody(created.referenceCode),
        [
          {
            text: ru.common.ok,
            onPress: () =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{ name: 'Home' }, { name: 'Complaints' }],
                }),
              ),
          },
        ],
      );
    } catch (e) {
      alert(ru.common.error, getApiErrorMessage(e, ru.complaints.failed));
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
        <ScreenHeader
          title={ru.nav.newComplaint}
          subtitle={ru.complaints.createSubtitle}
        />
        <Input
          variant="auth"
          label={ru.complaints.subject}
          value={subject}
          onChangeText={setSubject}
          placeholder={ru.complaints.subjectPlaceholder}
        />
        <Input
          variant="auth"
          label={ru.complaints.description}
          value={description}
          onChangeText={setDescription}
          placeholder={ru.complaints.descriptionPlaceholder}
          multiline
          numberOfLines={5}
          style={styles.textArea}
        />
        <Text style={styles.label}>{ru.complaints.serviceOptional}</Text>
        {departments.map((d) => (
          <Text
            key={d.id}
            onPress={() =>
              setDepartmentId(departmentId === d.id ? undefined : d.id)
            }
            style={[
              styles.deptChip,
              departmentId === d.id && styles.deptChipActive,
            ]}>
            {d.name}
          </Text>
        ))}
        <ImageAttachments images={images} onChange={setImages} />
        <Button
          label={ru.complaints.submit}
          onPress={submit}
          loading={loading}
          style={styles.submitBtn}
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
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  deptChip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: fontSize.lg,
    overflow: 'hidden',
  },
  deptChipActive: {
    borderColor: colors.borderActive,
    backgroundColor: colors.primaryMuted,
    color: colors.primary,
  },
  submitBtn: { marginTop: spacing.md },
});
