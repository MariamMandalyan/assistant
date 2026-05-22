import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { getToken } from '../api/client';
import { radius, spacing } from '../theme/spacing';
import type { ChatMessageAttachment } from '../api/types';

type Props = {
  attachments: ChatMessageAttachment[];
  alignEnd?: boolean;
};

export function ChatMessageImages({ attachments, alignEnd }: Props) {
  const [authHeaders, setAuthHeaders] = useState<
    Record<string, string> | undefined
  >();

  useEffect(() => {
    getToken().then((token) => {
      if (token) setAuthHeaders({ Authorization: `Bearer ${token}` });
    });
  }, []);

  if (attachments.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.row,
        alignEnd && styles.rowEnd,
      ]}>
      {attachments.map((img) => (
        <View key={img.id} style={styles.thumbWrap}>
          <Image
            source={
              img.remote && authHeaders
                ? { uri: img.uri, headers: authHeaders }
                : { uri: img.uri }
            }
            style={styles.thumb}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const TILE = 120;

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  rowEnd: { justifyContent: 'flex-end' },
  thumbWrap: {
    width: TILE,
    height: TILE,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  thumb: { width: '100%', height: '100%' },
});
