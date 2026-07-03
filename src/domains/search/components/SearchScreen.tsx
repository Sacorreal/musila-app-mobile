import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { useSearch } from '@/domains/search/hooks/use-search.hooks';
import { SearchBar } from '@/domains/search/components/SearchBar';
import { SearchResultItem } from '@/domains/search/components/SearchResultItem';
import { SearchEmptyState } from '@/domains/search/components/SearchEmptyState';
import { sortByNewest } from '@/domains/tracks/utils/sortTracks';
import type { SearchResult } from '@/domains/search/types/search.types';

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const { data: results = [], isLoading, isRefetching, refetch } = useSearch(query);
  const availableResults = sortByNewest(results.filter((result) => result.isAvailable));

  const handleResultPress = (_result: SearchResult) => {
    // Navegación futura al detalle de la canción
  };

  const showLoading = isLoading && query.length >= 2;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.bgOrb} pointerEvents="none" />

        <View style={styles.header}>
          <Text style={styles.title}>Buscar</Text>
          <Text style={styles.subtitle}>Encuentra canciones por título o artista</Text>
        </View>

        <View style={styles.searchWrapper}>
          <SearchBar onQueryChange={setQuery} />
        </View>

        {query.length >= 2 && !showLoading && availableResults.length > 0 && (
          <Text style={styles.resultsCount}>
            {availableResults.length} {availableResults.length === 1 ? 'resultado' : 'resultados'}
          </Text>
        )}

        {showLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={Brand.primary} size="large" />
          </View>
        )}

        {!showLoading && (
          <FlatList
            data={availableResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SearchResultItem result={item} onPress={handleResultPress} />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<SearchEmptyState hasQuery={query.length >= 2} />}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => {
                  if (query.trim().length >= 2) refetch();
                }}
                tintColor={Brand.primary}
                colors={[Brand.primary]}
              />
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#080B12',
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
    backgroundColor: 'rgba(32,138,239,0.06)',
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
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
  },
  searchWrapper: {
    marginBottom: 16,
  },
  resultsCount: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
});
