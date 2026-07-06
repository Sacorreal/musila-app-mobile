import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { useGenreById } from '@/domains/musical-genre/hooks/use-musical-genre.hooks';
import { SearchBar } from '@/domains/search/components/SearchBar';
import { useLanguages } from '../hooks/use-tracks.hooks';
import { GenreTracksFilterModal } from './GenreTracksFilterModal';
import { TrackCard } from './TrackCard';
import { sortByNewest } from '../utils/sortTracks';
import type { TracksResponseDto } from '../types/tracks.types';
import { HomeButton } from '@/shared/components/ui/HomeButton';
import { useMiniPlayerSpacing } from '@/domains/player/hooks/use-mini-player-spacing';
import { playTracks } from '@/domains/player/utils/playQueue';

export function GenreTracksScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const miniPlayerSpacing = useMiniPlayerSpacing();
  const { data: genre, isLoading, isError, isRefetching, refetch } = useGenreById(id ?? '');
  const { data: allLanguages = [] } = useLanguages();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubGenres, setSelectedSubGenres] = useState<string[]>([]);
  const [language, setLanguage] = useState('all');
  const [isGospel, setIsGospel] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const handleTrackPress = useCallback(
    (track: TracksResponseDto) => {
      router.push({ pathname: '/tracks/[id]', params: { id: track.id } });
    },
    [router],
  );

  const title = genre?.genre ?? name ?? 'Género';
  const tracks = useMemo(
    () => sortByNewest((genre?.tracks ?? []).filter((track) => track.isAvailable)),
    [genre],
  );

  const subGenreOptions = useMemo(
    () => Array.from(new Set(genre?.subGenre ?? [])).sort(),
    [genre],
  );

  const languageOptions = useMemo(() => {
    const codesWithTracks = new Set(tracks.map((t) => t.language).filter(Boolean));
    return allLanguages
      .filter((lang) => codesWithTracks.has(lang.code))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [tracks, allLanguages]);

  const filteredTracks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return tracks.filter((track) => {
      const matchesQuery = !normalizedQuery || track.title.toLowerCase().includes(normalizedQuery);
      const matchesSubGenre =
        selectedSubGenres.length === 0 || selectedSubGenres.includes(track.subGenre);
      const matchesLanguage = language === 'all' || track.language === language;
      const matchesGospel = !isGospel || track.isGospel;
      return matchesQuery && matchesSubGenre && matchesLanguage && matchesGospel;
    });
  }, [tracks, searchQuery, selectedSubGenres, language, isGospel]);

  const hasActiveFilters = selectedSubGenres.length > 0 || language !== 'all' || isGospel;

  const handlePlayAll = useCallback(() => {
    playTracks(filteredTracks, 0);
  }, [filteredTracks]);

  const handleToggleSubGenre = (value: string) => {
    setSelectedSubGenres((prev) =>
      prev.includes(value) ? prev.filter((sg) => sg !== value) : [...prev, value],
    );
  };

  const handleClearFilters = () => {
    setSelectedSubGenres([]);
    setLanguage('all');
    setIsGospel(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Brand.primary} size="large" />
      </View>
    );
  }

  if (isError || !genre) {
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
        <Text style={styles.errorTitle}>No se pudo cargar el género</Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {tracks.length > 0 && (
          <Pressable
            style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={20}
              color={hasActiveFilters ? Brand.accent : 'rgba(255,255,255,0.6)'}
            />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </Pressable>
        )}
        <HomeButton />
      </View>

      {tracks.length > 0 && (
        <View style={styles.searchWrapper}>
          <SearchBar onQueryChange={setSearchQuery} placeholder="Buscar canción..." />
        </View>
      )}

      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>
          {filteredTracks.length} {filteredTracks.length === 1 ? 'canción' : 'canciones'}
        </Text>
        {filteredTracks.length > 0 && (
          <Pressable
            style={({ pressed }) => [styles.playAllBtn, pressed && { opacity: 0.7 }]}
            onPress={handlePlayAll}
            accessibilityRole="button"
            accessibilityLabel="Reproducir todas las canciones"
          >
            <MaterialCommunityIcons name="play" size={14} color="#FFFFFF" style={styles.playAllIconOffset} />
            <Text style={styles.playAllBtnText}>Reproducir todo</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TrackCard track={item} onPress={handleTrackPress} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: 40 + miniPlayerSpacing }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Brand.primary} colors={[Brand.primary]} />
        }
        ListEmptyComponent={
          tracks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={styles.emptyTitle}>Sin canciones en este género todavía</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptySubtitle}>
                Ninguna canción coincide con la búsqueda o los filtros seleccionados
              </Text>
            </View>
          )
        }
      />

      <GenreTracksFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        subGenreOptions={subGenreOptions}
        selectedSubGenres={selectedSubGenres}
        onToggleSubGenre={handleToggleSubGenre}
        onClearSubGenres={() => setSelectedSubGenres([])}
        language={language}
        onLanguageChange={setLanguage}
        languageOptions={languageOptions}
        isGospel={isGospel}
        onIsGospelChange={setIsGospel}
        onClear={handleClearFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
    paddingHorizontal: 20,
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
    paddingTop: 16,
    paddingBottom: 8,
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
    ...Typography.title,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '700',
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(32,138,239,0.2)',
    borderColor: `${Brand.primary}60`,
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.accent,
  },
  searchWrapper: {
    marginBottom: 12,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Brand.primaryDark,
  },
  playAllIconOffset: {
    marginLeft: -1,
  },
  playAllBtnText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.caption,
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
