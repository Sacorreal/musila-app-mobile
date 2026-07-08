import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { Brand, Typography } from '@/constants/theme';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import { ShareToInstagramModal } from './ShareToInstagramModal';

interface PublishSuccessScreenProps {
  onReset: () => void;
  track: TracksResponseDto | null;
}

export function PublishSuccessScreen({ onReset, track }: PublishSuccessScreenProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <ReAnimated.View entering={FadeInDown.springify()} style={styles.container}>
      <MaterialCommunityIcons name="check-circle" size={64} color="#4ade80" />
      <Text style={styles.title}>¡Canción publicada!</Text>
      <Text style={styles.subtitle}>Tu canción está en revisión y estará disponible pronto</Text>

      {!!track && (
        <Pressable style={styles.shareBtn} onPress={() => setShareModalOpen(true)}>
          <MaterialCommunityIcons name="instagram" size={18} color="#FFFFFF" />
          <Text style={styles.shareBtnText}>Compartir en Instagram Stories</Text>
        </Pressable>
      )}

      <Pressable style={styles.btn} onPress={onReset}>
        <Text style={styles.btnText}>Publicar otra canción</Text>
      </Pressable>

      {!!track && (
        <ShareToInstagramModal visible={shareModalOpen} track={track} onClose={() => setShareModalOpen(false)} />
      )}
    </ReAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  title: {
    ...Typography.display,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 20,
  },
  shareBtnText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  btn: {
    marginTop: 16,
    backgroundColor: Brand.primaryDark,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
