import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { AddToPlaylistBottomSheet } from '@/domains/tracks/components/AddToPlaylistBottomSheet';
import { RequestUseModal } from '@/domains/tracks/components/RequestUseModal';
import type { AuthorTrackDto, TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import { usePlayerStore } from '@/shared/stores/player.store';
import { formatTime } from '../utils/formatTime';
import { PlayerSeekBar } from './PlayerSeekBar';

const COVER_PLACEHOLDER = require('@/assets/images/icon.png');

interface FullPlayerModalProps {
  track: TracksResponseDto | undefined;
  canRequestUse: boolean;
  canAddToPlaylist: boolean;
  onSeek: (seconds: number) => void;
}

export function FullPlayerModal({
  track,
  canRequestUse,
  canAddToPlaylist,
  onSeek,
}: FullPlayerModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const queue = usePlayerStore((s) => s.queue);
  const isExpanded = usePlayerStore((s) => s.isExpanded);
  const setExpanded = usePlayerStore((s) => s.setExpanded);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const skipNext = usePlayerStore((s) => s.skipNext);
  const skipPrev = usePlayerStore((s) => s.skipPrev);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPlaylistSheet, setShowPlaylistSheet] = useState(false);

  if (!currentTrack) return null;

  const coverSize = width - 80;
  const authors = (track?.authors ?? []) as (string | AuthorTrackDto)[];
  const authorObjects = authors.filter(
    (a): a is AuthorTrackDto => typeof a !== 'string' && !!a.id,
  );

  const handlePrev = () => {
    if (progress > 3 || queue.length === 0) {
      onSeek(0);
    } else {
      skipPrev();
    }
  };

  const handleAuthorPress = (authorId: string) => {
    setExpanded(false);
    router.push({ pathname: '/artists/[id]', params: { id: authorId } });
  };

  return (
    <Modal
      visible={isExpanded}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => setExpanded(false)}
    >
      <View style={styles.container}>
        <View style={styles.bgOrb1} pointerEvents="none" />
        <View style={styles.bgOrb2} pointerEvents="none" />

        <ScrollView
          style={{ paddingTop: insets.top }}
          contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
              onPress={() => setExpanded(false)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Cerrar reproductor"
            >
              <MaterialCommunityIcons name="chevron-down" size={26} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerLabel}>Reproduciendo</Text>
            <View style={styles.headerBtn} />
          </View>

          {/* Cover */}
          <View style={styles.coverWrapper}>
            <Image
              source={currentTrack.albumArt ? { uri: currentTrack.albumArt } : COVER_PLACEHOLDER}
              style={[styles.cover, { width: coverSize, height: coverSize }]}
              contentFit="cover"
            />
          </View>

          {/* Title & Authors */}
          <View style={styles.meta}>
            <Text style={styles.title} numberOfLines={2}>
              {currentTrack.title}
            </Text>
            {authorObjects.length > 0 ? (
              <View style={styles.authorsRow}>
                {authorObjects.map((author, index) => (
                  <Pressable
                    key={author.id}
                    onPress={() => handleAuthorPress(author.id)}
                    hitSlop={6}
                    accessibilityRole="link"
                  >
                    <Text style={styles.authorLink}>
                      {author.name} {author.lastName}
                      {index < authorObjects.length - 1 ? ',' : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.artistPlain}>{currentTrack.artist}</Text>
            )}
          </View>

          {/* Seek bar */}
          <View style={styles.seekSection}>
            <PlayerSeekBar progress={progress} duration={duration} onSeek={onSeek} />
            <View style={styles.timesRow}>
              <Text style={styles.timeText}>{formatTime(progress)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <Pressable
              onPress={handlePrev}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Anterior"
            >
              <MaterialCommunityIcons name="skip-previous" size={38} color="#FFFFFF" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.playPauseBtn, pressed && { transform: [{ scale: 0.94 }] }]}
              onPress={() => setPlaying(!isPlaying)}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              <MaterialCommunityIcons
                name={isPlaying ? 'pause' : 'play'}
                size={34}
                color="#FFFFFF"
                style={!isPlaying ? { marginLeft: 3 } : undefined}
              />
            </Pressable>

            <Pressable
              onPress={skipNext}
              disabled={queue.length === 0}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Siguiente"
            >
              <MaterialCommunityIcons
                name="skip-next"
                size={38}
                color={queue.length === 0 ? 'rgba(255,255,255,0.25)' : '#FFFFFF'}
              />
            </Pressable>
          </View>

          {/* Actions */}
          {(canAddToPlaylist || canRequestUse) && !!track && (
            <View style={styles.actions}>
              {canAddToPlaylist && (
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => setShowPlaylistSheet(true)}
                >
                  <MaterialCommunityIcons name="playlist-plus" size={20} color={Brand.accent} />
                  <Text style={styles.actionBtnText}>Playlist</Text>
                </Pressable>
              )}
              {canRequestUse && (
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => setShowRequestModal(true)}
                >
                  <MaterialCommunityIcons name="file-document-edit-outline" size={20} color={Brand.accent} />
                  <Text style={styles.actionBtnText}>Solicitar Uso</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Lyric */}
          <View style={styles.lyricSection}>
            <Text style={styles.sectionTitle}>Letra</Text>
            {track?.lyric ? (
              <View style={styles.lyricCard}>
                <Text style={styles.lyricText}>{track.lyric}</Text>
              </View>
            ) : (
              <Text style={styles.lyricEmpty}>Letra no disponible</Text>
            )}
          </View>
        </ScrollView>

        {canRequestUse && !!track && (
          <RequestUseModal
            visible={showRequestModal}
            track={track}
            onClose={() => setShowRequestModal(false)}
          />
        )}
        {canAddToPlaylist && !!track && (
          <AddToPlaylistBottomSheet
            visible={showPlaylistSheet}
            track={track}
            onClose={() => setShowPlaylistSheet(false)}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },
  bgOrb1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(32,138,239,0.07)',
    top: -80,
    right: -100,
  },
  bgOrb2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(60,159,254,0.05)',
    bottom: 200,
    left: -60,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  coverWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  cover: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 16,
  },
  meta: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  title: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  authorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  authorLink: {
    ...Typography.body,
    color: Brand.accent,
    fontWeight: '600',
  },
  artistPlain: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  seekSection: {
    marginBottom: 20,
  },
  timesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    marginBottom: 28,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.primaryDark,
    // @ts-ignore
    experimental_backgroundImage: `linear-gradient(135deg, ${Brand.primaryDark}, ${Brand.accent})`,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(60,159,254,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(60,159,254,0.25)',
  },
  actionBtnText: {
    ...Typography.label,
    color: Brand.accent,
    fontWeight: '600',
  },
  lyricSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 14,
  },
  lyricCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 18,
  },
  lyricText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 28,
  },
  lyricEmpty: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
    fontStyle: 'italic',
  },
});
