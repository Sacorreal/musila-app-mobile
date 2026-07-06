import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';
import { ArtistsRow } from '@/domains/artists/components/ArtistsRow';
import type { ArtistDto } from '@/domains/artists/types/artists.types';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { GenreRow } from '@/domains/musical-genre/components/GenreRow';
import type { MusicalGenreDto } from '@/domains/musical-genre/types/musical-genre.types';
import { FeaturedTracksList } from '@/domains/tracks/components/FeaturedTracksList';
import { MyTracksList } from '@/domains/tracks/components/MyTracksList';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import { UserRole } from '@/domains/users/types/users.types';
import { useMiniPlayerSpacing } from '@/domains/player/hooks/use-mini-player-spacing';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const miniPlayerSpacing = useMiniPlayerSpacing();
  const [refreshing, setRefreshing] = useState(false);

  const isAuthor = role === UserRole.AUTOR;
  const isCantautor = role === UserRole.CANTAUTOR;
  const canPublish = role === UserRole.AUTOR || role === UserRole.CANTAUTOR;

  const handlePublishPress = useCallback(() => {
    router.push('/publish' as any);
  }, [router]);

  const handleMorePress = useCallback(() => {
    router.push('/more' as any);
  }, [router]);

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
      contentContainerStyle={[styles.content, { paddingBottom: 40 + miniPlayerSpacing }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Brand.primary} colors={[Brand.primary]} />
      }
    >
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />

      <ReAnimated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.greeting} numberOfLines={1}>
              Hola, {user?.name ?? 'Músico'}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Descubre y gestiona tu música
            </Text>
          </View>

          <View style={styles.headerActions}>
            {canPublish && (
              <Pressable
                style={({ pressed }) => [styles.publishBtn, pressed && { opacity: 0.7 }]}
                onPress={handlePublishPress}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Publicar canción"
              >
                <MaterialCommunityIcons name="music-note-plus" size={18} color="#4ade80" />
                <Text style={styles.publishBtnText}>Publicar</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.7 }]}
              onPress={handleMorePress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Más opciones"
            >
              <MaterialCommunityIcons name="menu" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </ReAnimated.View>

      {(isAuthor || isCantautor) && (
        <ReAnimated.View entering={FadeInDown.delay(120).springify()}>
          <MyTracksList onTrackPress={handleTrackPress} />
        </ReAnimated.View>
      )}

      {isCantautor && <View style={styles.divider} />}

      {!isAuthor && (
        <ReAnimated.View entering={FadeInDown.delay(isCantautor ? 240 : 120).springify()} style={styles.section}>
          <GenreRow onGenrePress={handleGenrePress} />
        </ReAnimated.View>
      )}

      {!isAuthor && <View style={styles.divider} />}

      {!isAuthor && (
        <ReAnimated.View entering={FadeInDown.delay(isCantautor ? 360 : 240).springify()} style={styles.section}>
          <ArtistsRow onArtistPress={handleArtistPress} />
        </ReAnimated.View>
      )}

      {!isAuthor && <View style={styles.divider} />}

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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTextBlock: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.35)',
  },
  publishBtnText: {
    ...Typography.caption,
    color: '#4ade80',
    fontWeight: '700',
  },
  section: {
    marginTop: 28,
    marginBottom: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 4,
  },
});
