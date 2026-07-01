import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReAnimated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { UserRole } from '@/domains/users/types/users.types';
import { useTrackById } from '@/domains/tracks/hooks/use-tracks.hooks';
import { usePlayerStore, type Track } from '@/shared/stores/player.store';
import type { TracksResponseDto } from '../types/tracks.types';
import { IntellectualPropertySection } from './IntellectualPropertySection';
import { TrackRequestsSection } from './TrackRequestsSection';
import { AddToPlaylistBottomSheet } from './AddToPlaylistBottomSheet';

const COVER_PLACEHOLDER = require('@/assets/images/icon.png');

function mapToPlayerTrack(track: TracksResponseDto): Track {
  const artist = (track.authors as any[])
    .map((a) => (typeof a === 'string' ? a : `${a.name} ${a.lastName}`))
    .join(', ');
  return {
    id: track.id,
    title: track.title,
    artist,
    albumArt: track.coverUrl ?? undefined,
    audioUrl: track.audioUrl ?? '',
    duration: 0,
  };
}

export function TrackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.user?.role);
  const { data: track, isLoading, isError, refetch } = useTrackById(id ?? '');
  const setTrack = usePlayerStore((s) => s.setTrack);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlaying = usePlayerStore((s) => s.setPlaying);

  const [showPlaylistSheet, setShowPlaylistSheet] = useState(false);

  const isAuthorRole = role === UserRole.AUTOR || role === UserRole.CANTAUTOR;
  const canAddToPlaylist = role !== UserRole.AUTOR;
  const canSeeRequests =
    role === UserRole.AUTOR || role === UserRole.CANTAUTOR || role === UserRole.ADMIN;

  const isCurrentlyPlaying = currentTrack?.id === track?.id && isPlaying;

  const handlePlay = () => {
    if (!track?.audioUrl) return;
    if (currentTrack?.id === track.id) {
      setPlaying(!isPlaying);
    } else {
      setTrack(mapToPlayerTrack(track));
    }
  };

  const handleEdit = () => {
    router.push({ pathname: '/tracks/editar/[id]', params: { id: id! } });
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <View style={styles.bgOrb1} pointerEvents="none" />
        <View style={styles.bgOrb2} pointerEvents="none" />
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonCover} />
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '60%' }]} />
        <ActivityIndicator color={Brand.primary} style={{ marginTop: 32 }} />
      </View>
    );
  }

  if (isError || !track) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Pressable
          style={[styles.backBtn, { position: 'absolute', top: insets.top + 12, left: 20 }]}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.2)" />
        <Text style={styles.errorTitle}>No se pudo cargar el track</Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const authorLabel = (track.authors as any[])
    .map((a) => (typeof a === 'string' ? a : `${a.name} ${a.lastName}`))
    .join(', ');

  return (
    <>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bgOrb1} pointerEvents="none" />
        <View style={styles.bgOrb2} pointerEvents="none" />

        {/* Header */}
        <ReAnimated.View entering={FadeIn.duration(200)} style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {track.title}
          </Text>
          {isAuthorRole && (
            <Pressable
              style={({ pressed }) => [styles.editIconBtn, pressed && { opacity: 0.6 }]}
              onPress={handleEdit}
              hitSlop={12}
            >
              <MaterialCommunityIcons name="pencil-outline" size={20} color={Brand.accent} />
            </Pressable>
          )}
        </ReAnimated.View>

        {/* Cover */}
        <ReAnimated.View entering={FadeInDown.delay(60).springify()} style={styles.coverWrapper}>
          <Image
            source={track.coverUrl ? { uri: track.coverUrl } : COVER_PLACEHOLDER}
            style={styles.cover}
            contentFit="cover"
          />
          <View style={[styles.availabilityDot, track.isAvailable ? styles.dotActive : styles.dotInactive]} />
        </ReAnimated.View>

        {/* Title & Authors */}
        <ReAnimated.View entering={FadeInDown.delay(120).springify()} style={styles.meta}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          {!!authorLabel && (
            <Text style={styles.authors}>{authorLabel}</Text>
          )}
          <Text style={styles.availabilityLabel}>
            {track.isAvailable ? 'Disponible para licenciar' : 'No disponible'}
          </Text>
        </ReAnimated.View>

        {/* Badges */}
        <ReAnimated.View entering={FadeInDown.delay(160).springify()} style={styles.badges}>
          {!!track.genre && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{track.genre}</Text>
            </View>
          )}
          {!!track.subGenre && (
            <View style={[styles.badge, styles.badgeSecondary]}>
              <Text style={[styles.badgeText, styles.badgeTextSecondary]}>{track.subGenre}</Text>
            </View>
          )}
          {!!track.language && (
            <View style={[styles.badge, styles.badgeTertiary]}>
              <MaterialCommunityIcons name="translate" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={[styles.badgeText, styles.badgeTextTertiary]}>{track.language}</Text>
            </View>
          )}
          {track.isGospel && (
            <View style={[styles.badge, styles.badgeGospel]}>
              <Text style={[styles.badgeText, styles.badgeTextGospel]}>Gospel</Text>
            </View>
          )}
        </ReAnimated.View>

        {/* Action Buttons */}
        <ReAnimated.View entering={FadeInDown.delay(200).springify()} style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.playBtn,
              !track.audioUrl && styles.btnDisabled,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
            onPress={handlePlay}
            disabled={!track.audioUrl}
          >
            <MaterialCommunityIcons
              name={isCurrentlyPlaying ? 'pause' : 'play'}
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.playBtnText}>
              {isCurrentlyPlaying ? 'Pausar' : 'Reproducir'}
            </Text>
          </Pressable>

          {canAddToPlaylist && (
            <Pressable
              style={({ pressed }) => [styles.playlistBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setShowPlaylistSheet(true)}
            >
              <MaterialCommunityIcons name="playlist-plus" size={20} color={Brand.accent} />
              <Text style={styles.playlistBtnText}>Playlist</Text>
            </Pressable>
          )}
        </ReAnimated.View>

        {/* Lyric */}
        {!!track.lyric && (
          <ReAnimated.View entering={FadeInDown.delay(260).springify()} style={styles.lyricSection}>
            <Text style={styles.sectionTitle}>Letra</Text>
            <View style={styles.lyricCard}>
              <Text style={styles.lyricText}>{track.lyric}</Text>
            </View>
          </ReAnimated.View>
        )}

        {/* Intellectual Property */}
        <ReAnimated.View entering={FadeInDown.delay(320).springify()}>
          <IntellectualPropertySection
            intellectualProperties={track.intellectualProperties ?? []}
          />
        </ReAnimated.View>

        {/* Received Requests */}
        {canSeeRequests && (
          <ReAnimated.View entering={FadeInDown.delay(380).springify()}>
            <TrackRequestsSection trackId={track.id} />
          </ReAnimated.View>
        )}
      </ScrollView>

      {canAddToPlaylist && (
        <AddToPlaylistBottomSheet
          visible={showPlaylistSheet}
          track={track}
          onClose={() => setShowPlaylistSheet(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  center: {
    flex: 1,
    backgroundColor: '#080B12',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
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

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
    fontWeight: '600',
  },
  editIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(60,159,254,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* Cover */
  coverWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  cover: {
    width: 260,
    height: 260,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
  },
  availabilityDot: {
    position: 'absolute',
    bottom: 8,
    right: '50%',
    marginRight: -138,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#080B12',
  },
  dotActive: { backgroundColor: '#4ade80' },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.3)' },

  /* Meta */
  meta: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  trackTitle: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  authors: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  availabilityLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  /* Badges */
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(32,138,239,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeSecondary: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  badgeTertiary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  badgeGospel: {
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  badgeText: {
    ...Typography.caption,
    color: Brand.accent,
    fontWeight: '600',
  },
  badgeTextSecondary: {
    color: 'rgba(255,255,255,0.6)',
  },
  badgeTextTertiary: {
    color: 'rgba(255,255,255,0.4)',
  },
  badgeTextGospel: {
    color: '#FBB024',
  },

  /* Actions */
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  playBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Brand.primaryDark,
    // @ts-ignore
    experimental_backgroundImage: `linear-gradient(90deg, ${Brand.primaryDark}, ${Brand.accent})`,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  playBtnText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  playlistBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(60,159,254,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(60,159,254,0.25)',
  },
  playlistBtnText: {
    ...Typography.label,
    color: Brand.accent,
    fontWeight: '600',
  },

  /* Lyric */
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

  /* Skeleton / Error */
  skeletonHeader: {
    width: '70%',
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: 24,
  },
  skeletonCover: {
    width: 260,
    height: 260,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: 20,
  },
  skeletonLine: {
    width: '80%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10,
  },
  errorTitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(32,138,239,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(32,138,239,0.3)',
  },
  retryText: {
    ...Typography.label,
    color: Brand.accent,
    fontWeight: '600',
  },
});
