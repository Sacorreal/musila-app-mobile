import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { useMiniPlayerSpacing } from '@/domains/player/hooks/use-mini-player-spacing';
import { sortByNewest } from '@/domains/tracks/utils/sortTracks';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import { useTheme } from '@/shared/hooks/use-theme';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { RecentSearches } from './RecentSearches';
import { SearchBar } from './SearchBar';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchErrorState } from './SearchErrorState';
import { SearchFilters } from './SearchFilters';
import { SearchListRow } from './SearchListRow';
import { SearchResultItem } from './SearchResultItem';
import { SearchSkeletonList } from './SearchSkeletonList';
import { useSearch } from '../hooks/use-search.hooks';
import { useSearchTracks } from '../hooks/use-search-tracks.hooks';
import { useRecentSearchesStore } from '../store/useRecentSearchesStore';
import type {
  SearchAuthorDto,
  SearchGenreDto,
  SearchListItem,
  SearchResult,
  SearchSectionKey,
} from '../types/search.types';
import type { SearchFiltersState } from '../types/search-filters.types';

export function SearchScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const miniPlayerSpacing = useMiniPlayerSpacing();
  const addSearch = useRecentSearchesStore((s) => s.addSearch);

  const [rawQuery, setRawQuery] = useState('');
  const [filters, setFilters] = useState<SearchFiltersState>({});
  const [viewAllTracks, setViewAllTracks] = useState(false);

  const debouncedQuery = useDebouncedValue(rawQuery, 400);
  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);
  const useTracksMode = hasActiveFilters || viewAllTracks;

  const combinedSearch = useSearch(useTracksMode ? '' : debouncedQuery);
  const tracksSearch = useSearchTracks(useTracksMode ? debouncedQuery : '', filters);

  const handleQueryChange = useCallback((text: string) => {
    setRawQuery(text);
    setViewAllTracks(false);
  }, []);

  const handleFiltersChange = useCallback((next: SearchFiltersState) => {
    setFilters(next);
    setViewAllTracks(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (rawQuery.trim().length >= 2) addSearch(rawQuery);
  }, [rawQuery, addSearch]);

  const handleSelectRecent = useCallback((query: string) => {
    setRawQuery(query);
  }, []);

  const handleTrackPress = useCallback(
    (track: SearchResult) => {
      if (debouncedQuery.trim().length >= 2) addSearch(debouncedQuery);
      router.push({ pathname: '/tracks/[id]', params: { id: track.id } });
    },
    [router, debouncedQuery, addSearch],
  );

  const handleAuthorPress = useCallback(
    (author: SearchAuthorDto) => {
      if (debouncedQuery.trim().length >= 2) addSearch(debouncedQuery);
      router.push({ pathname: '/artists/[id]', params: { id: author.id } });
    },
    [router, debouncedQuery, addSearch],
  );

  const handleGenrePress = useCallback(
    (genre: SearchGenreDto) => {
      if (debouncedQuery.trim().length >= 2) addSearch(debouncedQuery);
      router.push({ pathname: '/tracks/genero/[id]', params: { id: genre.id, name: genre.genre } });
    },
    [router, debouncedQuery, addSearch],
  );

  const handleSeeAll = useCallback((section: SearchSectionKey) => {
    if (section === 'tracks') setViewAllTracks(true);
  }, []);

  const listItems = useMemo<SearchListItem[]>(() => {
    if (useTracksMode || !combinedSearch.data) return [];

    const { tracks, authors, musicalGenres, meta } = combinedSearch.data;
    const items: SearchListItem[] = [];

    if (tracks.length > 0) {
      items.push({ kind: 'header', section: 'tracks', label: 'Canciones' });
      items.push(...tracks.map((track): SearchListItem => ({ kind: 'track', section: 'tracks', data: track })));
      if (meta.hasMoreTracks) {
        items.push({ kind: 'see-all', section: 'tracks', label: 'Ver todos los resultados de canciones', total: meta.tracksTotal });
      }
    }

    if (authors.length > 0) {
      items.push({ kind: 'header', section: 'authors', label: 'Artistas' });
      items.push(...authors.map((author): SearchListItem => ({ kind: 'author', section: 'authors', data: author })));
    }

    if (musicalGenres.length > 0) {
      items.push({ kind: 'header', section: 'genres', label: 'Géneros' });
      items.push(...musicalGenres.map((genre): SearchListItem => ({ kind: 'genre', section: 'genres', data: genre })));
    }

    return items;
  }, [useTracksMode, combinedSearch.data]);

  const tracksModeData = useMemo<TracksResponseDto[]>(() => {
    if (!useTracksMode) return [];
    const pages = tracksSearch.data?.pages ?? [];
    const flat = pages.flatMap((page) => page.data);
    return sortByNewest(flat);
  }, [useTracksMode, tracksSearch.data]);

  const isLoading = useTracksMode
    ? tracksSearch.isLoading
    : combinedSearch.isLoading && debouncedQuery.trim().length >= 2;
  const isError = useTracksMode ? tracksSearch.isError : combinedSearch.isError;
  const hasQuery = rawQuery.trim().length >= 2;
  const isEmpty = useTracksMode ? tracksModeData.length === 0 : listItems.length === 0;

  const handleRetry = useCallback(() => {
    if (useTracksMode) tracksSearch.refetch();
    else combinedSearch.refetch();
  }, [useTracksMode, tracksSearch, combinedSearch]);

  const resultsCount = useTracksMode
    ? tracksSearch.data?.pages[0]?.total ?? 0
    : (combinedSearch.data?.meta.tracksTotal ?? 0) +
      (combinedSearch.data?.meta.authorsTotal ?? 0) +
      (combinedSearch.data?.meta.genresTotal ?? 0);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.bgOrb, { backgroundColor: `${Brand.primary}0F` }]} pointerEvents="none" />

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Buscar</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Encuentra canciones, artistas o géneros
          </Text>
        </View>

        <View style={styles.searchWrapper}>
          <SearchBar value={rawQuery} onChangeText={handleQueryChange} onSubmit={handleSubmit} />
        </View>

        <SearchFilters filters={filters} onChange={handleFiltersChange} />

        {!hasQuery && !hasActiveFilters ? (
          <RecentSearches onSelect={handleSelectRecent} />
        ) : (
          <>
            {!isLoading && !isError && resultsCount > 0 && (
              <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
                {resultsCount} {resultsCount === 1 ? 'resultado' : 'resultados'}
              </Text>
            )}

            {isLoading && <SearchSkeletonList />}

            {!isLoading && isError && <SearchErrorState onRetry={handleRetry} />}

            {!isLoading && !isError && isEmpty && <SearchEmptyState hasQuery={hasQuery} />}

            {!isLoading && !isError && !isEmpty && useTracksMode && (
              <FlashList
                data={tracksModeData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SearchResultItem result={item} query={debouncedQuery} onPress={handleTrackPress} />
                )}
                contentContainerStyle={{ paddingBottom: 40 + miniPlayerSpacing }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                onEndReachedThreshold={0.4}
                onEndReached={() => {
                  if (tracksSearch.hasNextPage && !tracksSearch.isFetchingNextPage) {
                    tracksSearch.fetchNextPage();
                  }
                }}
              />
            )}

            {!isLoading && !isError && !isEmpty && !useTracksMode && (
              <FlashList
                data={listItems}
                keyExtractor={(item, index) => {
                  if (item.kind === 'header' || item.kind === 'see-all') return `${item.kind}-${item.section}`;
                  return `${item.kind}-${item.data.id}-${index}`;
                }}
                getItemType={(item) => item.kind}
                renderItem={({ item }) => (
                  <SearchListRow
                    item={item}
                    query={debouncedQuery}
                    onPressTrack={handleTrackPress}
                    onPressAuthor={handleAuthorPress}
                    onPressGenre={handleGenrePress}
                    onSeeAll={handleSeeAll}
                  />
                )}
                contentContainerStyle={{ paddingBottom: 40 + miniPlayerSpacing }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bgOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -60,
    right: -80,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    gap: 4,
  },
  title: {
    ...Typography.display,
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.body,
  },
  searchWrapper: {
    marginBottom: 16,
  },
  resultsCount: {
    ...Typography.caption,
    marginBottom: 8,
  },
});
