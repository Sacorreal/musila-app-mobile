import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { UserRole } from '@/domains/users/types/users.types';
import { MyTracksList } from '@/domains/tracks/components/MyTracksList';
import { FeaturedTracksList } from '@/domains/tracks/components/FeaturedTracksList';
import { GenreRow } from '@/domains/musical-genre/components/GenreRow';
import { ArtistsRow } from '@/domains/artists/components/ArtistsRow';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import type { MusicalGenreDto } from '@/domains/musical-genre/types/musical-genre.types';
import type { ArtistDto } from '@/domains/artists/types/artists.types';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const [refreshing, setRefreshing] = useState(false);

  const isAuthor = role === UserRole.AUTOR;
  const isCantautor = role === UserRole.CANTAUTOR;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['musical-genres'] }),
      queryClient.invalidateQueries({ queryKey: ['artists'] }),
      queryClient.invalidateQueries({ queryKey: ['tracks'] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  const handleTrackPress = useCallback(
    (track: TracksResponseDto) => {
      router.push({ pathname: '/tracks/[id]', params: { id: track.id } });
    },
    [router],
  );

  const handleGenrePress = useCallback(
    (genre: MusicalGenreDto) => {
      router.push({ pathname: '/tracks/genero/[id]', params: { id: genre.id, name: genre.genre } });
    },
    [router],
  );

  const handleArtistPress = useCallback(
    (artist: ArtistDto) => {
      router.push({ pathname: '/artists/[id]', params: { id: artist.id } });
    },
    [router],
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Brand.primary} colors={[Brand.primary]} />
      }
    >
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />

      <ReAnimated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
        <Text style={styles.greeting}>
          Hola, {user?.name ?? 'Músico'} 👋
        </Text>
        <Text style={styles.subtitle}>Descubre y gestiona tu música</Text>
      </ReAnimated.View>

      {(isAuthor || isCantautor) && (
        <ReAnimated.View entering={FadeInDown.delay(120).springify()}>
          <MyTracksList onTrackPress={handleTrackPress} />
        </ReAnimated.View>
      )}

      {!isAuthor && (
        <ReAnimated.View entering={FadeInDown.delay(isCantautor ? 240 : 120).springify()} style={styles.section}>
          <GenreRow onGenrePress={handleGenrePress} />
        </ReAnimated.View>
      )}

      {!isAuthor && (
        <ReAnimated.View entering={FadeInDown.delay(isCantautor ? 360 : 240).springify()} style={styles.section}>
          <ArtistsRow onArtistPress={handleArtistPress} />
        </ReAnimated.View>
      )}

      {!isAuthor && (
        <ReAnimated.View entering={FadeInDown.delay(isCantautor ? 480 : 360).springify()} style={styles.section}>
          <FeaturedTracksList onTrackPress={handleTrackPress} />
        </ReAnimated.View>
      )}
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
    paddingBottom: 40,
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
  header: {
    paddingTop: 24,
    paddingBottom: 24,
    gap: 4,
  },
  greeting: {
    ...Typography.display,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
  },
  section: {
    marginTop: 28,
    marginBottom: 8,
  },
});
