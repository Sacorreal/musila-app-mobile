import { useEffect } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import { useShareInstagramStory } from '../hooks/use-share-instagram-story.hooks';
import { ShareStoryCard, STORY_CARD_HEIGHT, STORY_CARD_WIDTH } from './ShareStoryCard';

interface ShareToInstagramModalProps {
  visible: boolean;
  track: TracksResponseDto;
  onClose: () => void;
}

const PREVIEW_SCALE = 0.68;

export function ShareToInstagramModal({ visible, track, onClose }: ShareToInstagramModalProps) {
  const { cardRef, localCoverUri, isPreparing, isSharing, error, prepareCover, share } = useShareInstagramStory();

  useEffect(() => {
    if (visible) prepareCover(track.coverUrl || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, track.coverUrl]);

  const authorName = Array.isArray(track.authors)
    ? track.authors
        .map((a) => (typeof a === 'string' ? a : `${a.name} ${a.lastName}`.trim()))
        .filter(Boolean)
        .join(', ')
    : undefined;

  const handleShare = async () => {
    const result = await share(track);
    if (result === 'shared') {
      onClose();
    } else if (result === 'not-installed') {
      Toast.show({ type: 'error', text1: 'Instagram no está instalado' });
    } else if (result === 'error') {
      Toast.show({ type: 'error', text1: 'No se pudo compartir', text2: 'Intenta de nuevo' });
    }
    // 'cancelled': sin Toast, el modal permanece abierto
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card}>
          <Text style={styles.title}>¡Comparte tu logro!</Text>
          <Text style={styles.subtitle}>Publica esta historia en tu Instagram</Text>

          <View style={styles.previewWrapper}>
            <View
              style={[
                styles.previewClip,
                { width: STORY_CARD_WIDTH * PREVIEW_SCALE, height: STORY_CARD_HEIGHT * PREVIEW_SCALE },
              ]}
            >
              <View style={{ transform: [{ scale: PREVIEW_SCALE }] }}>
                <ShareStoryCard
                  ref={cardRef}
                  title={track.title}
                  authorName={authorName}
                  localCoverUri={localCoverUri}
                />
              </View>
            </View>
            {isPreparing && (
              <View style={styles.previewLoading}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.85 }]}
            onPress={handleShare}
            disabled={isSharing || isPreparing}
          >
            {isSharing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Compartir en Instagram Stories</Text>
            )}
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Ahora no</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 8,
  },
  previewWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  previewClip: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  previewLoading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  errorText: {
    ...Typography.caption,
    color: 'rgba(255,85,85,0.9)',
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
});
