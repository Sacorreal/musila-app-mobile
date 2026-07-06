import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { TrackCard } from '@/domains/tracks/components/TrackCard';
import { sortByNewest } from '@/domains/tracks/utils/sortTracks';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import { HomeButton } from '@/shared/components/ui/HomeButton';
import { formatFullName } from '@/shared/utils/formatName';
import { useMiniPlayerSpacing } from '@/domains/player/hooks/use-mini-player-spacing';
import { useArtistById } from '../hooks/use-artists.hooks';

const AVATAR_SIZE = 96;

export function ArtistProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const miniPlayerSpacing = useMiniPlayerSpacing();
  const { data: artist, isLoading, isError, isRefetching, refetch } = useArtistById(id ?? '');

  const handleTrackPress = useCallback(
    (track: TracksResponseDto) => {
      router.push({ pathname: '/tracks/[id]', params: { id: track.id } });
    },
    [router],
  );

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Brand.primary} size="large" />
      </View>
    );
  }

  if (isError || !artist) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Pressable
          style={[styles.backBtn, { position: 'absolute', top: insets.top + 12, left: 20 }]}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ position: 'absolute', top: insets.top + 12, right: 20 }}>
          <HomeButton />
        </View>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.2)" />
        <Text style={styles.errorTitle}>No se pudo cargar el compositor</Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const fullName = formatFullName(artist.name, artist.lastName);
  const initials = `${artist.name?.[0] ?? ''}${artist.lastName?.[0] ?? ''}`.toUpperCase();
  const tracks = sortByNewest((artist.tracks ?? []).filter((track) => track.isAvailable));

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.content, { paddingBottom: 60 + miniPlayerSpacing }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Brand.primary} colors={[Brand.primary]} />
      }
    >
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <HomeButton />
      </View>

      <View style={styles.hero}>
        {artist.avatar ? (
          <Image source={{ uri: artist.avatar }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitials}>{initials || '?'}</Text>
          </View>
        )}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{fullName}</Text>
          {artist.isVerified && (
            <MaterialCommunityIcons name="check-decagram" size={20} color={Brand.accent} />
          )}
        </View>
      </View>

      {!!artist.biography && (
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>Biografía</Text>
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{artist.biography}</Text>
          </View>
        </View>
      )}

      <View style={styles.tracksSection}>
        <Text style={styles.sectionTitle}>
          Canciones {tracks.length > 0 ? `(${tracks.length})` : ''}
        </Text>
        {tracks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎵</Text>
            <Text style={styles.emptyTitle}>Este compositor aún no tiene canciones publicadas</Text>
          </View>
        ) : (
          tracks.map((track) => (
            <TrackCard key={track.id} track={track} onPress={handleTrackPress} />
          ))
        )}
      </View>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
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
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(32,138,239,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(32,138,239,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: Brand.accent,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  bioSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 14,
  },
  bioCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 18,
  },
  bioText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 24,
  },
  tracksSection: {
    marginBottom: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingHorizontal: 20,
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
