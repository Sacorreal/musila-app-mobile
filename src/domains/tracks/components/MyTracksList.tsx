import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { SearchBar } from '@/domains/search/components/SearchBar';
import { useMyAuthorTracks } from '../hooks/use-tracks.hooks';
import { MyTracksFilterModal } from './MyTracksFilterModal';
import { TrackCard } from './TrackCard';
import type { AvailabilityFilter, TracksResponseDto } from '../types/tracks.types';
import { resolveGenreName } from '../utils/resolveGenreName';

interface MyTracksListProps {
  onTrackPress?: (track: TracksResponseDto) => void;
}

export function MyTracksList({ onTrackPress }: MyTracksListProps) {
  const { data: tracks = [], isLoading } = useMyAuthorTracks();
  const [searchQuery, setSearchQuery] = useState('');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');
  const [genre, setGenre] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const genreOptions = useMemo(
    () => Array.from(new Set(tracks.map((t) => resolveGenreName(t.genre)).filter(Boolean))).sort(),
    [tracks],
  );

  const filteredTracks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return tracks.filter((track) => {
      const matchesQuery = !normalizedQuery || track.title.toLowerCase().includes(normalizedQuery);
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'available' ? track.isAvailable : !track.isAvailable);
      const matchesGenre = genre === 'all' || resolveGenreName(track.genre) === genre;
      return matchesQuery && matchesAvailability && matchesGenre;
    });
  }, [tracks, searchQuery, availability, genre]);

  const hasActiveFilters = availability !== 'all' || genre !== 'all';

  const handleClearFilters = () => {
    setAvailability('all');
    setGenre('all');
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Brand.primary} size="large" />
      </View>
    );
  }

  if (tracks.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🎵</Text>
        <Text style={styles.emptyTitle}>Sin canciones aún</Text>
        <Text style={styles.emptySubtitle}>Publica tu primera canción en la tab Publicar</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Mis canciones</Text>

      <View style={styles.toolbar}>
        <View style={styles.searchWrapper}>
          <SearchBar onQueryChange={setSearchQuery} placeholder="Buscar en mis canciones..." />
        </View>
        <Pressable
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={22}
            color={hasActiveFilters ? Brand.accent : 'rgba(255,255,255,0.6)'}
          />
          {hasActiveFilters && <View style={styles.filterDot} />}
        </Pressable>
      </View>

      {filteredTracks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptySubtitle}>
            Ninguna canción coincide con los filtros seleccionados
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TrackCard track={item} onPress={onTrackPress} />}
          scrollEnabled={false}
        />
      )}

      <MyTracksFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        availability={availability}
        onAvailabilityChange={setAvailability}
        genres={genreOptions}
        genre={genre}
        onGenreChange={setGenre}
        onClear={handleClearFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 32,
    alignItems: 'center',
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
  },
  emptySubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchWrapper: {
    flex: 1,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(32,138,239,0.2)',
    borderColor: `${Brand.primary}60`,
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.accent,
  },
});
