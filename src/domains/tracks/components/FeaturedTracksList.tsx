import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { useFeaturedTracks } from '../hooks/use-tracks.hooks';
import { FeaturedTrackCard } from './FeaturedTrackCard';
import { sortByNewest } from '../utils/sortTracks';
import type { TracksResponseDto } from '../types/tracks.types';

interface FeaturedTracksListProps {
  onTrackPress?: (track: TracksResponseDto) => void;
}

const MAX_FEATURED_TRACKS = 8;

export function FeaturedTracksList({ onTrackPress }: FeaturedTracksListProps) {
  const router = useRouter();
  const { data: tracks = [], isLoading } = useFeaturedTracks();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Brand.primary} size="small" />
      </View>
    );
  }

  const availableTracks = sortByNewest(tracks.filter((track) => track.isAvailable));

  if (availableTracks.length === 0) return null;

  const visibleTracks = availableTracks.slice(0, MAX_FEATURED_TRACKS);

  return (
    <View>
      <Text style={styles.sectionTitle}>Canciones destacadas</Text>
      <FlatList
        data={visibleTracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <FeaturedTrackCard track={item} onPress={onTrackPress} />
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
      />
      <Pressable
        style={({ pressed }) => [styles.searchMoreBtn, pressed && { opacity: 0.7 }]}
        onPress={() => router.push('/(tabs)/search' as any)}
      >
        <MaterialCommunityIcons name="magnify" size={18} color={Brand.accent} />
        <Text style={styles.searchMoreText}>Buscar más</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    gap: 10,
  },
  gridItem: {
    flex: 1,
  },
  searchMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(60,159,254,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(60,159,254,0.25)',
  },
  searchMoreText: {
    ...Typography.label,
    color: Brand.accent,
    fontWeight: '600',
  },
});
