import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getToken } from '../api/client';
import {
  launchImageLibrary,
  type Asset,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';
import { alert } from '../context/AlertModalContext';
import { ru } from '../i18n';
import type { ComplaintImage } from '../types/complaint';

const pickerOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
};

type Props = {
  images: ComplaintImage[];
  onChange: (images: ComplaintImage[]) => void;
  readonly?: boolean;
  variant?: 'complaint' | 'chat';
  maxImages?: number;
  compact?: boolean;
};

function assetToImage(asset: Asset, index: number): ComplaintImage {
  return {
    id: asset.fileName ?? `img-${Date.now()}-${index}`,
    uri: asset.uri ?? '',
    fileName: asset.fileName ?? undefined,
  };
}

export function ImageAttachments({
  images,
  onChange,
  readonly,
  variant = 'complaint',
  maxImages = 5,
  compact = false,
}: Props) {
  const copy = variant === 'chat' ? ru.chat : ru.complaints;
  const [authHeaders, setAuthHeaders] = useState<
    Record<string, string> | undefined
  >();

  useEffect(() => {
    if (!images.some((i) => i.remote)) return;
    getToken().then((token) => {
      if (token) setAuthHeaders({ Authorization: `Bearer ${token}` });
    });
  }, [images]);

  const pickImages = () => {
    if (readonly) return;
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      alert(ru.common.error, copy.maxPhotos(maxImages));
      return;
    }

    launchImageLibrary(
      { ...pickerOptions, selectionLimit: remaining },
      (response) => {
        if (response.didCancel || response.errorMessage) return;
        const picked = (response.assets ?? [])
          .filter((a) => a.uri)
          .map(assetToImage);
        if (picked.length === 0) return;
        onChange([...images, ...picked].slice(0, maxImages));
      },
    );
  };

  const remove = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {!compact ? <Text style={styles.label}>{copy.photos}</Text> : null}
      {!readonly && !compact ? (
        <Text style={styles.hint}>{copy.photosHint}</Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {!readonly ? (
          <Pressable onPress={pickImages} style={styles.addTile}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>{copy.addPhoto}</Text>
          </Pressable>
        ) : null}
        {images.map((img) => (
          <View key={img.id} style={styles.thumbWrap}>
            <Image
              source={
                img.remote && authHeaders
                  ? { uri: img.uri, headers: authHeaders }
                  : { uri: img.uri }
              }
              style={styles.thumb}
            />
            {!readonly ? (
              <Pressable
                onPress={() => remove(img.id)}
                style={styles.removeBtn}
                hitSlop={8}>
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const TILE = 88;

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  wrapCompact: { marginBottom: spacing.sm },
  label: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  addTile: {
    width: TILE,
    height: TILE,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  addIcon: {
    fontSize: fontSize.xxl,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  addText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  thumbWrap: {
    width: TILE,
    height: TILE,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  thumb: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.text,
    fontSize: fontSize.lg,
    lineHeight: 20,
    fontWeight: '700',
  },
});
